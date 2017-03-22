import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Mongo } from 'meteor/mongo';
 
import './main.html';
const Rooms = new Mongo.Collection('room');
const Chats = new Mongo.Collection('chat');
Meteor.subscribe('room',[],function(){
  Session.set('oldchats',Rooms.find({}).fetch());
});
Meteor.subscribe('userList');
Template.room.onRendered (function() {

  Streamy.on('room_client', (data)=> { // Listent Room
    var d = new Date();
    $('#box').append('<p><b>'+data.username+'</b> : '+data.message
      +'<time>'+d.getHours()+':'+d.getMinutes()+'</time>'
      +'</p>');
    if($('#box').height() > $('#room').height()){
      $('#room').animate({
              scrollTop: $('#box').height()
          }, 0);
    }
  });

  Streamy.on('person_client', (data)=> { // Listent Personal Chat
  var member = {};
  member.username = Session.get('username');
    var d = new Date();

    if(member.username == data.to){
      var text = $('#example').html();

      if($( ".person-chat" ).find(data.from).length == 0){
        Meteor.subscribe('chat',[],function(){
        var oldchat = Chats.find( { 

          $or: [ { "from":data.from ,"to":data.to}, { "from":data.to,"to":data.from } ] 

        } ).fetch();

          var from = ' input[name="username_from"]';
          var to = ' input[name="username_to"]';



          $('.person-chat').append('<'+data.from+'>' + text+'</'+data.from+'>');

          $(data.from+to).val(data.from);
          $(data.from+from).val(data.to);
          oldchat.forEach(function(item,i){
            $(data.from+' .chat .room .box').append('<p><b>'+item.from+'</b> : '+item.message
            +'<time>'+item.time+'</time>'
            +'</p>');
          });

        });

        
       

      }

      $(data.from+' .chat .room .box').append('<p><b>'+data.from+'</b> : '+data.message
      +'<time>'+d.getHours()+':'+d.getMinutes()+'</time>'
      +'</p>');

        if($('#box').height() > $('#room').height()){
          $('#room').animate({
                  scrollTop: $('#box').height()
              }, 0);
        }
 
      
    }else{
      $(data.to+' .chat .room .box').append('<p><b>'+data.from+'</b> : '+data.message
      +'<time>'+d.getHours()+':'+d.getMinutes()+'</time>'
      +'</p>');
      if($('#box').height() > $('#room').height()){
        $('#room').animate({
                scrollTop: $('#box').height()
            }, 0);
      }

    }
  
  });



});
Template.room.helpers({
  oldchats : function(){ // Old chat from db
    return Session.get('oldchats');
  },
  members :function(){  // List Member
    var members = Meteor.users.find({
      _id:{$ne : Meteor.userId()}
    }).fetch();
    return members;
  }
  ,myusername :function(){ 
    // var members = Meteor.users.find({
    //   _id: Meteor.userId()
    // }).fetch();
    // console.log(Meteor.user());;
    if(Meteor.user()){
    Session.set('username',Meteor.user().username)
    return Session.get('username');
    }
  }
});

Template.room.events({ // Sent Message DDP and Save DB
  'click .list span'(event){
  
    var user = $(event.target).html();
    var text = $('#example').html();
    var from = ' input[name="username_from"]';
    var to = ' input[name="username_to"]';
    if(!$(this).attr('click') == '1'){
      $(this).attr('click','1');
      $('.person-chat').append('<'+user+'>'+ text+'</'+user+'>');
      $(user+to).val(user);
      $(user+from).val(Session.get('username'));
      $(user+' .chat').prepend(user);
      Meteor.subscribe('chat',[],function(){
        var oldchat = Chats.find( { 

          $or: [ 
          { "from":Session.get('username') ,"to":user}
          , { "from":user,"to":Session.get('username') } 
          ] 

        } ).fetch();

          var from = ' input[name="username_from"]';
          var to = ' input[name="username_to"]';
          oldchat.forEach(function(item,i){
            $(user+' .chat .room .box').append('<p><b>'+item.from+'</b> : '+item.message
            +'<time>'+item.time+'</time>'
            +'</p>');
          });

      });
    }

  },
  'submit .chat form'(event){
    event.preventDefault();
    let d = new Date();
    Chats.insert({ 
      username : event.target.username_from.value ,
      message: event.target.message.value ,
      from : event.target.username_from.value ,
      to : event.target.username_to.value,
      target:'person',
      time:d.getHours()+':'+d.getMinutes() });
    Streamy.emit('person_server', { 
      username : event.target.username_from.value ,
      message: event.target.message.value ,
      from : event.target.username_from.value ,
      to : event.target.username_to.value,
      target:'person',
      time:d.getHours()+':'+d.getMinutes() });
    $(event.target)[0].reset();
  },
  'submit #room-form'(event) {
    event.preventDefault();
    let d = new Date();
    Rooms.insert({ 
      username : event.target.username.value ,
      message: event.target.message.value ,
      target:'room',
      time:d.getHours()+':'+d.getMinutes() });
    Streamy.emit('room_server', { 
      username : event.target.username.value ,
      message: event.target.message.value ,
      target:'room' });
    $(event.target)[0].reset();
  },
  'click #logout'(){
    Meteor.logout(function(){
      location.reload();
    });
    
  }
});

Template.index.helpers({
   currentUser:  Meteor.userId()
});

Template.login.events({
  'submit #login'(event) {
  	event.preventDefault();
    var username = event.target.username.value;
    var password =  event.target.password.value;

		Accounts.createUser({
            username: username,
            password: password,
        });
    Meteor.loginWithPassword(username, password, function(error){
      if(error){
        alert('Password Failed');
      }
		});


  },
});
