# Online Contact

This is an implementation of the addictive word game Contact! (rules
below) to allow users to play games long-distance across the
Internet. It uses [node.js](http://nodejs.com) and
[socket.io](http://socket.io) as a server to synchronize multiple
clients. The server does very little other than to act as a traffic
director to send signals between clients.

# Rules of Contact 

There is a [Wikipedia article](http://en.wikipedia.org/wiki/Contact_(word_game%29)
about Contact, with a lot of listed variations of the game. Since I
learned to play from a bunch of folks from Long Beach, CA, I'm calling
this version "Long Beach Contact."

The game requires at least 3 players. There is no hard upper limit,
but once you top about 15 it starts becoming unmanageable. One player
is the wordmaster, while the others are active players. The wordmaster
chooses a word (ideally a long, rare one, but not so rare the players
will *never* be able to guess it). Proper nouns are not allowed.

She does not tell the other players what word she is thinking of, but
she does divulge the first letter. In the online version, a user
becomes wordmaster by entering their word in the top box on the page
and pressing enter.

Each player then tries to think up clues for a word that begins with
the letters they have so far (more on that later; at the beginning the
only letter they have is the first letter). They say their clue aloud;
if another player knows the word they are thinking of, the other
player says 'Contact!,' the two players count down together from 10
(by the rules they are supposed to count ten seconds, but in practice
the players generally try to count as quickly as they possibly can)
and call out the word. If they both say the same word, the wordmaster
must divulge the next letter of her original word (which the players
are trying to guess). Proper nouns are permitted as clue words.

If the wordmaster solves a clue at any time before the two players
call it out (either before they contact or during the 10-count), that
clue is invalidated.

For instance, if the wordmaster thought of the word 'noctilucent,' she
would divulge to the players the first letter n. Then, player 1 might
think of the word 'nupitals' and say 'Wedding.' If player 2 figured
this out and said 'contact 10...1 nupitals!,' the wordmaster must
divulge the next letter (o). Now, all clue words must start with 'no,'
and so on.

The players win when the word the wordmaster thought of is used in
clue. In some versions, the clue has to actually be solved, but in
many cases the wordmaster gives the word away when a clue is mentioned
that clearly refers to the word. This is the way the web contact
works. If the word never comes up, the game ends in a draw; the
wordmaster can never win. (I've only ever seen this once, with the
word sawzall
[which could be considered a proper noun; nothing else starts with 'sawz']. We
once came very close with yggsdrasil).

Every so often, when things begin to look like a draw, the wordmaster
will give a clue at her own discretion. If someone solves that clue,
the next letter will be given.

# Playing Online

The one thing to remember while playing online is that things *must*
be exact; antidisestablishmentarianistic is *not* the same word as
antidisestablishmentarianism. The tool is not case sensitive.

When you connect to the contact server, you will be prompted for a
username (which can be anything you want it to be) and a game to
connect to. If you type the name of a game that is already in
progress, you will be connected to that game, otherwise a new game
will be created by that name and you will be connected to it. You can
become the wordmaster by typing a word in the 'Become Wordmaster' box
at the top of the screen. Anyone can become the wordmaster at any
time; it is assumed the players are friends and won't grab wordmaster
unnecessarily.

You only see what happens in a game *after* you join it; things that
have already happened you will not see. Thus, you should not start
playing until all the expected players are present. Since any players
who are added to the game after it starts will not be able to see the
word, it will be quite impossible to join a game already in progress.

You can give a clue by typing in a word and the clue for that word,
respectively, into the two boxes. You can answer a clue by typing in
the answer below the question that appears.

You can use the chat-room feature of the site by typing into the
bottom box.

There is a [hosted version](http://onlinecontact.heroku.com) or you
can play locally (see below).

# Running it Locally

There are a few ways, simplest:
```shell
git clone git://github.com/mattwigway/online-contact.git
cd online-contact
npm install
node contact.js
```

Alternately, you can use foreman to deploy (e.g., on
[Heroku](http://heroku.com)).
