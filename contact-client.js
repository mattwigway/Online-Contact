$(document).ready(function () {
    var socket = io.connect('http://localhost:7501');
    
    // when a connection is established, this flag is enabled
    var active = false;

    var targetWord;
    
    // this is how many letters they have so far
    var letters;

    var clues = {};

    // server push
    socket.on('connect', function () {
	socket.emit('add user', prompt('enter a username'));
    });

    socket.on('user added', function () {
	socket.emit('connect to game', prompt('enter a game to connect to. undefined games will be created'));
    });

    socket.on('connected to game', function () {
	active = true;
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
			    socket.emit('contact', clue, word);
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
	socket.emit('set word and wordmaster', $('#wordmaster-word').val());
    });

    $('#chatin').submit(function (e) {
	e.preventDefault();
	socket.emit('send chat', $('#chatin input').val());
    });
});
			  
	