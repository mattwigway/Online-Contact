/**
   contact.js: play the game of Contact over long distances
   @author mattwigway
 */

var PORT = 7501;
var IP = 'localhost';

var http = require('http');

var app = http.createServer(handler);

app.listen(PORT, IP);
var io = require('socket.io').listen(app);

function handler (req, res) {
    res.writeHead(200);
    res.end('You are connected to the stream server. Please connect using' +
	    ' a Contact client.');
}

// here's the workhorse
io.sockets.on('connection', function (socket) {
    console.log('new connection');

    // since it's a closure, user persists into inner functions
    socket.on('add user', function (user) {
	socket.emit('user added');

	// now, make these available
	socket.on('connect to game', function (game) {
	    socket.join(game);
	    socket.emit('connected to game');
	    console.log('broadcasting');
	    
	    console.log(user);
	    // it's a chat message that will look like INFO: mattwigway has joined the game
	    io.sockets.in(socket.room).emit('receive chat', 'INFO', user + ' has joined the game');
	    
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
		    io.sockets.in(socket.room).emit('remove clue', clue, word);
		    io.sockets.in(socket.room).emit('receive chat', user, 'I answered clue ' + clue + ' with ' + word);
		}
		else {
		    io.sockets.in(socket.room).emit('receive contact', clue, word);
		    io.sockets.in(socket.room).emit('receive chat', user, 'I won clue ' + clue + ' with ' + word);
		}
	    });

	    socket.on('send chat', function (chat) {
		io.sockets.in(socket.room).emit('receive chat', user, chat);
	    });

	    // TODO: some sort of security so that not just anyone can grab wordmaster?
	    socket.on('set word and wordmaster', function (word) {
		// each browser caches the whole thing
		io.sockets.in(socket.room).emit('set word', word);
		io.sockets.in(socket.room).emit('receive chat', user, 'I am now wordmaster. The letter is ' + word[0]);
		
		// TODO: take wordmaster from everyone else
	    });

	    socket.on('send win', function (word) {
		io.sockets.in(socket.room).emit('receive win');
		io.sockets.in(socket.room).emit('receive chat', 'GAME OVER', 'The game has been won by ' + user + ' with word ' + word);
	    });
	});
    });
});