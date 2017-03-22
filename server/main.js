import { Meteor } from 'meteor/meteor';
import '../imports/db.js';

const Rooms = new Mongo.Collection('room');
const Chats = new Mongo.Collection('chat');
Meteor.publish('userList', function (){ 
  return Meteor.users.find({});
});
Meteor.publish('room', function() {
    return Rooms.find({});   
 });
Meteor.publish('chat', function() {
    return Chats.find({});   
 });

Meteor.startup(() => {

	Streamy.on('room_server', (d, s)=> {

  	Streamy.broadcast('room_client', d);
	});
	
	Streamy.on('person_server', (d, s)=> {

  	Streamy.broadcast('person_client', d);
	});
});
