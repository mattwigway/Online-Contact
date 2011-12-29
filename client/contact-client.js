$(document).ready(function () {
    var socket = io.connect('http://localhost:7501');
    
    // when a connection is established, this flag is enabled
    var active = false;

    var targetWord;
    
    // this is how many letters they have so far
    var letters;

    // is this user the wordmaster
    var wordmaster = false;

    var clues = {};

    var username = null;
    var game = null;
    
    while (!username | !game) {
	username = prompt('enter a username');
	game = prompt('enter a game');
    }

    // server push
    socket.on('connect', function () {
	socket.emit('add user', username);
    });

    socket.on('user added', function () {
	socket.emit('connect to game', game);
    });

    socket.on('connected to game', function () {
	active = true;
	// set up some documentation of the location
	var uri = username + '@' + game;
	$('title').text('(' + uri + ') ' + $('title').text());
    });

    socket.on('receive chat', function (user, chat) {
	$('#chat').prepend($('<p>').text(user + ': ' + chat));
    });

    socket.on('receive clue', function (clue, word, user) {
	
	var htclue = 	    
	    $('<li>').text(user + ' gives clue ' + clue)
	    .append($('<form><input type="text" class="answer"/><input type="submit"/></form>')
		    .submit(function (e) {
			e.preventDefault();
			
			console.log($(this).find('.answer').val(), word);

			if ($(this).find('.answer').val() == word) {
			    // we send the wordmaster flag along; if the wordmaster solves a clue that clue is deleted.
			    socket.emit('contact', clue, word, wordmaster);
			}
		    })
		   );

	clues[clue + ':' + word] = htclue;
	
	$('#clues ul').append(htclue);
    });	

    socket.on('set word', function (theWord) {
	targetWord = theWord;
	$('#word').text(targetWord[0]);
	letters = 1;
    });

    // remove a clue when the wordmaster guesses it
    socket.on('remove clue', function (clue, word) {
	clues[clue + ':' + word].remove(); // no need to garbage collect; clues is cleared on a new letter or game
    });

    socket.on('receive contact', function (clue, word) {
	// get rid of the clues
	$('#clues ul li').remove();
	clues = {};

	// give another letter
	letters += 1;
	$('#word').text(targetWord.slice(0, letters));
    });

    socket.on('receive win', function () {
	// flash
	$.each([0, 1, 2, 3, 4], function (ind, i) {
	    setTimeout(function () {
		$('body').css('background', '#f51');
	    }, i*1000);
	    setTimeout(function () {
		$('body').css('background', '#fff');
	    }, i*1000 + 500);
	});
	
	$('#word').text(targetWord);
    });
		       

    $('#clues form').submit(function (e) {
	e.preventDefault();

	// check that the clue actually starts with the correct letters
	// TODO: doubles, triples, &c. E.g., if the letter is m and one user says 'below-glacial deposit', another
	// (correctly) answers with 'medial moraine', they should get *two* letters.
	if ($('#clueword').val().slice(0, $('#word').text().length) != $('#word').text()) {
	    alert('Invalid word!');
	    return;
	}
	    
	// check if the user won
	if ($('#clueword').val() == targetWord) {
	    // the target word is not cached on the server, send it back
	    socket.emit('send win', targetWord);
	    return;
	}

	socket.emit('send clue', $('#clue').val(), $('#clueword').val());
    });

    $('#wordmaster').submit(function (e) {
	e.preventDefault();
	wordmaster = true;

	socket.emit('set word and wordmaster', $('#wordmaster-word').val());
    });

    $('#chatin').submit(function (e) {
	e.preventDefault();
	socket.emit('send chat', $('#chatin input').val());
    });
});
			  
	