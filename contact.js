/**
   contact.js: play the game of Contact over long distances
   @author mattwigway

   Copyright 2011 Matt Conway

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */

var PORT = process.env.PORT || 7501;

var express = require('express');
var app = express.createServer();

// serve the client files
app.configure(function () {
    app.use(express.static(__dirname + '/client'));
});

app.listen(PORT);

var io = require('socket.io').listen(app);


// here's the workhorse
io.sockets.on('connection', function (socket) {
    console.log('new connection');

    // since it's a closure, user persists into inner functions
    socket.on('add user', function (user) {
	socket.emit('user added');

	// now, make these available
	socket.on('connect to game', function (game) {
	    socket.join(game);
	    socket.emit('connected to game ' + socket.in());
	    console.log('broadcasting');
	    
	    console.log(user);
	    // it's a chat message that will look like INFO: mattwigway has joined the game
	    io.sockets.in(game).emit('receive chat', 'INFO', user + ' has joined the game');
	    
	    // TODO: how to send user list?
	    
	    // these are only available in a game
	    socket.on('send clue', function (clue, word) {
		// people can cheat by looking at the HTTP responses, but this avoids a round-trip to the server
		// we send the user b/c it may be useful to other players to know who wrote a clue, for inside jokes &c.
		socket.broadcast.to(game).emit('receive clue', clue, word, user);
	    });

	    // woohoo!
	    socket.on('contact', function (clue, word, wordmaster) {
		// wordmaster is a bool that says whether the originating client is wordmaster
		if (wordmaster) {
		    io.sockets.in(game).emit('remove clue', clue, word);
		    io.sockets.in(game).emit('receive chat', user, 'I answered clue ' + clue + ' with ' + word);
		}
		else {
		    io.sockets.in(game).emit('receive contact', clue, word);
		    io.sockets.in(game).emit('receive chat', user, 'I won clue ' + clue + ' with ' + word);
		}
	    });

	    socket.on('send chat', function (chat) {
		io.sockets.in(game).emit('receive chat', user, chat);
	    });

	    // TODO: some sort of security so that not just anyone can grab wordmaster?
	    socket.on('set word and wordmaster', function (word) {
		// each browser caches the whole thing
		io.sockets.in(game).emit('set word', word);
		io.sockets.in(game).emit('receive chat', user, 'I am now wordmaster. The letter is ' + word[0]);
		
		// TODO: take wordmaster from everyone else
	    });

	    socket.on('send win', function (word) {
		io.sockets.in(game).emit('receive win');
		io.sockets.in(game).emit('receive chat', 'GAME OVER', 'The game has been won by ' + user + ' with word ' + word);
	    });
	});
    });
});