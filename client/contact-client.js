/**
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

$(document).ready(function () {
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
    var socket = io.connect('/');
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

			if ($(this).find('.answer').val().toLowerCase() == word.toLowerCase()) {
			    var sendContact = function () {
				// we send the wordmaster flag along; if the wordmaster solves a clue that clue is deleted.
				// if the clue is no longer there, the wordmaster has solved it in the meantime
				if (clues[clue + ':' + word] != undefined) {
				    socket.emit('contact', clue, word, wordmaster);
				}
			    };
			    
			    if (wordmaster) {
				// the wordmaster can answer a clue without counting backwards from 10
				sendContact();
			    }
			    else {
				socket.emit('send chat', 'CONTACT! ' + clue + ' --- 10, 9, 8, 7, 6, 5, 4, 3, 2, 1')
				setTimeout(sendContact, 2500); // it takes me about 2.5s to count backwards from 10
			    }
			}
		    })
		   );

	clues[clue + ':' + word] = htclue;
	
	$('#clues ul').append(htclue);
    });	

    socket.on('set word', function (theWord) {
	// capitalization &c is handled by originating client
	targetWord = theWord;
	$('#word').text(targetWord[0]);
	letters = 1;
    });

    // remove a clue when the wordmaster guesses it
    socket.on('remove clue', function (clue, word) {
	try {
	    clues[clue + ':' + word].remove();
	    clues[clue + ':' + word] = undefined;
	}
	catch (err) {
	    // do nothing, it probably didn't exist
	}
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

    // someone grabbed wordmaster
    socket.on('unset wordmaster', function (user) {
	// TODO: user contains new wordmaster. Should something be done, or is the chat message enough?
	wordmaster = false;
    });

    $('#clues form').submit(function (e) {
	e.preventDefault();

	// check that the clue actually starts with the correct letters
	// TODO: doubles, triples, &c. E.g., if the letter is m and one user says 'below-glacial deposit', another
	// (correctly) answers with 'medial moraine', they should get *two* letters.
	if ($('#clueword').val().slice(0, $('#word').text().length).toLowerCase() != $('#word').text().toLowerCase()) {
	    alert('Invalid word!');
	    // return true to allow the form to be resubmitted
	    return;
	}
	    
	// check if the user won
	if ($('#clueword').val().toLowerCase() == targetWord.toLowerCase()) {
	    // the target word is not cached on the server, send it back
	    socket.emit('send win', targetWord);
	    return;
	}

	socket.emit('send clue', $('#clue').val(), $('#clueword').val());
	
	// clear the boxes
	$('#clueword').val('');
	$('#clue').val('');

    });

    $('#wordmaster').submit(function (e) {
	e.preventDefault();
	wordmaster = true;

	// capitalize
	var word = $('#wordmaster-word').val().toLowerCase();
	word = word[0].toUpperCase() + word.slice(1);

	// clear input
	$('#wordmaster-word').val('');

	socket.emit('set word and wordmaster', word); 
    });

    $('#chatin').submit(function (e) {
	e.preventDefault();
	// clear
	socket.emit('send chat', $('#sendchat').val());
	$('#sendchat').val('');
    });
});
			  
	