var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Receive messages from the user and start the first dialogue
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("Hello, this is your personal musical assistant!");
	session.beginDialog('/startD')
});

//Setting up QnA maker
var qnarecognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: '0bba3cf1-21e1-40d9-9ce4-7fe059992193', 
    subscriptionKey: '873988af65bd498285a485f557f8e9d8'});

// Setting up LUIS Recognizer
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c9d23030-53e7-4d35-ba84-ad572ff2229c?subscription-key=98b6d6a72718470c98e1a91f2a29dc67&timezoneOffset=0&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Start first Dialogue
bot.dialog('/startD', intents, function (session, args, next) {
	session.send('I can help you with your musical questions! Try asking me about which scales to use over chord progressions or the name of an interval')
})

// Adding QnA and Luis recognizers to the bot
var intents = new builder.IntentDialog({ recognizers: [recognizer, qnarecognizer] });
bot.dialog('/startD', intents);


// Response to the FindInterval Intent
intents.matches('FindInterval', [

	function (session, args) {
	
   	var intervalEntity = builder.EntityRecognizer.findEntity(args.entities, 'Interval');
	var chordEntity = builder.EntityRecognizer.findEntity(args.entities, 'Chords');
	
		session.send(findinter(intervalEntity.entity, chordEntity.entity));
	
	}
	
]);

// Response to the FindDistance Intent
intents.matches('FindDistance', [

	function (session, args) {
	
   		var notesEntity = builder.EntityRecognizer.findAllEntities(args.entities, 'Notes');
		
		session.send(notesEntity[0].entity);
		
		session.send(finddist(notesEntity[0].entity, notesEntity[1].entity));
		
	}
	
]);


// Answering Questions in the QnA maker knowledge base
intents.matches('qna', [

    function (session, args, next) {

        var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'answer');

        session.send(answerEntity.entity);

    }

]);


// Answer if none of the intents match or no answer in QnA knowledge base
intents.onDefault([

    function(session){

        session.send('Sorry!! No match!!');

	}

]);



// Response to the 'CreateHarmony' intent
bot.dialog('CreateHarmony', function (session) {
    session.send('Create Harmony');
}).triggerAction({ matches: 'CreateHarmony' });


// Response to the 'FindScale' intent
bot.dialog('FindScale', function (session) {
    session.send("FindScale");
}).triggerAction({ matches: 'FindScale' });

//takes two notes and returns the first part of the name
function finddist(fnote, snote){
	
	var secondhalf = interval(notetonum(fnote), notetonum(snote));;
	var semidist = Math.abs(semiNoteToNum(snote)-semiNoteToNum(fnote));
	
	if(secondhalf == "unison"){
		if(semidist == 0){
			return "perfect unison";
		}else if(semidist == 1){
			return "augmented unison";
		}
	}else if(secondhalf == "second"){
		if(semidist == 1){
			return "minor second";
		}else if(semidist == 2){
			return "major second";
		}else if(semidist == 3){
			return "augmented second";
		}
	}else if(secondhalf == "third"){
		if(semidist == 2){
			return "diminished third";
		}else if(semidist == 3){
			return "minor third";
		}else if(semidist == 4){
			return "major third";
		}else if(semidist == 5){
			return "augmented third";
		}
	}else if(secondhalf == "fourth"){
		if(semidist == 4){
			return "diminished fourth";
		}else if(semidist == 5){
			return "perfect fourth";
		}else if(semidist == 6){
			return "augmented fourth";
		}
	}else if(secondhalf == "fifth"){
		if(semidist == 6){
			return "diminished fifth";
		}else if(semidist == 7){
			return "perfect";
		}else if(semidist == 8){
			return "augmented fifth";
		}
	}else if(secondhalf == "sixth"){
		if(semidist == 7){
			return "diminished sixth";
		}else if(semidist == 8){
			return "minor sixth";
		}else if(semidist == 9){
			return "major sixth";
		}else if(semidist == 10){
			return "augmented sixth";
		}
	}else{
		return "couldn't find interval";
	}
}

//takes two notes and returns the second part of the name
function interval(fnote, snote){
	var inter = Math.abs(snote-fnote);
	
	switch(inter){
		case 0:
			return "unison";
			break;
		case 1:
			return "second";
			break;
		case 2:
			return "third";
			break;
		case 3:
			return "fourth";
			break;
		case 4:
			return "fifth";
			break;
		case 5:
			return "sixth";
			break;
		case 6:
			return "seventh";
			break;
	}
}

//takes a note and converts it into a number from 1 to 7
function notetonum(note){
	switch(note){
		case "a":
			return 1;
			break;
		case "b":
			return 2;
			break;
		case "c": 
			return 3;
			break;
		case "d":
			return 4;
			break;
		case "e":
			return 5;
			break;
		case "f":
			return 6;
			break;
		case "g":
			return 7;
			break;
	}
}

//takes a note and converts it into a number, taking into account sharps and flats
function semiNoteToNum(note){
	switch(note){
		case "a":
			return 1;
			break;
		case "a #":
			return 2;
			break;
		case "b":
			return 3;
			break;
		case "c":
			return 4;
			break;
		case "c#":
			return 5;
			break;
		case "d":
			return 6;
			break;
		case "d #":
			return 7;
			break;
		case "e":
			return 8;
			break;
		case "f":
			return 9;
			break;
		case "F#":
			return 10;
			break;
		case "g":
			return 11;
			break;
		case "G#":
			return 12;
			break;
	}
}

//takes an interval and a chord and finds the next chord along with tonality according to the major scale
function findinter(i, c){
	if(i == "second"){
		return "that would be " + nextchord(c, 2) + " minor";
	}else if(i == "third"){
		return "that would be " + nextchord(c, 4) + " minor";
	}else if(i == "fourth"){
		return "that would be " + nextchord(c, 5) + " major";
	}else if(i == "fifth"){
		return "that would be " + nextchord(c, 7) + " major";
	}else if(i == "sixth"){
		return "that would be " + nextchord(c, 9) + " minor";
	}else if(i == "seventh"){
		return "that would be " + nextchord(c, 11) + " diminished";
	}else{
		return "something went wrong";
	}
}

//takes a chord and the number of semitones and assigns the next chord
function nextchord (c, s){
	var majorchordnum = majorchordtonum(c);
	var newchordnum = majorchordnum+s;
	return numtomajorchord(newchordnum);
}

//takes a number and returns it as a chord 
function numtomajorchord(n){

	var chordnum = n%12;
	switch (chordnum){
		case 1:
			return "A";
			break;
		case 2:
			return "A#";
			break;
		case 3:
			return "B";
			break;
		case 4:
			return "C";
			break;
		case 5:
			return "C#";
			break;
		case 6:
			return "D";
			break;
		case 7:
			return "D#";
			break;
		case 8:
			return "E";
			break;
		case 9:
			return "F";
			break;
		case 10:
			return "F#";
			break;
		case 11:
			return "G";
			break;
		case 12:
			return "G#";
			break;
	}
}

//takes a major chord and assigns it a number from 1 to 12
function majorchordtonum(c){
	switch (c){
		case "amaj":
			return 1;
			break;
		case "bmaj":
			return 3;
			break;
		case "cmaj":
			return 4;
			break;
		case "dmaj":
			return 6;
			break;
		case "emaj":
			return 8;
			break;
		case "fmaj":
			return 9;
			break;
		case "gmaj":
			return 11;
			break;
	}
}