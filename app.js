var nanoTimer = require('./nanotimer');
var midi = require('midi');
var output = new midi.output();
var input = new midi.input();


var songs = [
	/*0 Otters*/
	[
		[],
		[57, 64, 69, 76],
		[57, 62, 69, 74],
		[57, 64, 69, 76, 81, 88],
		[57, 62, 69, 74, 81, 86],
		[57, 64, 69, 76, 81, 88, 93, 100],
		[57, 62, 69, 74, 81, 86, 93, 98],
	],

	/*1 Left Handed Stanger*/
	[
		[],
		[62, 67, 74, 79], // D G
		[62, 69, 74, 81], // D A
		[62, 71, 74, 83], // D B
		
		[50, 54, 62, 66], // D F#
		[47, 50, 59, 62], // B D
		[45, 50, 57, 62], // A D

		[47, 50, 52, 54, 
		59, 62, 64, 66,
		71, 74, 76, 78,
		83, 86, 88, 90], //B D E F# *4
	],

	/*2 Drag Race*/
	[
		[],
		[69, 78, 81, 90], //A F#
		[69, 74, 81, 86], //A D
		[73, 76, 85, 88], //C# E
		[69, 76, 81, 88], //A E
		[64, 76, 76, 88], //E E
		
		[64, 71, 76, 83], //E B
		[71, 76, 83, 88], //B E

		[81, 76, 93, 88], //A E
		[81, 78, 93, 90], //A F#
		[81, 76, 93, 88], //A E
		[81, 73, 93, 85], //A C#
	],
];



var clockCount = 0;
var selectedSong = 0;
var partStep = 0;
var selectedPart = 1;
var part = songs[selectedSong][selectedPart];


// INPUT 1
for(var i=0; i < input.getPortCount(); i++){
	console.log(input.getPortName(i));
	if( input.getPortName(i) == 'mio 20:0' ){
		input.openPort(i);
	}
}
input.ignoreTypes(false, false, false);

// OUTPUT
for(var i=0; i < output.getPortCount(); i++){
	if( output.getPortName(i) == 'mio 20:0' ){
		output.openPort(i);
	}
}

input.on('message', function(deltaTime, message) {
	// CLOCK STOP
	if(message == 250){
		clockCount = 0;
	}

	// CLOCK TICK
	if(message == 248){
		handleClockTick();
	}

	// PGMIN RC-1
	if(message[0] == 194){
		var oldPart = selectedPart;
		selectedPart = handlePgmin(message);
		if(selectedPart >= songs[selectedSong].length){
			selectedPart = songs[selectedSong].length-1
		}
		part = songs[selectedSong][selectedPart]

		if(partStep >= part.length){
			partStep = 0;
		}
		
		if(oldPart == 0){
			partStep = 0;
			var diff = process.hrtime(countTimeStamp);
			//console.log('main diff', diff[1]);
			//if(diff[1] > 99999999){
			if(diff[1] > tickTime*.85){
				timeOffset = '0n';
				//console.log('big');
				//console.log(tickTime);
			} else {
				timeOffset = '0n';
				playNote();
				timeOffset = diff[1]+'n';
			}
		}

	}

	// PGMIN MIDI MOUSE - Channel 2
	if(message[0] == 192){
		selectedSong = message[1];
		if(selectedSong >= songs.length){
			selectedSong = songs.length - 1;
		}
	}

	// CC 1
	if(message[0] == 176){
		//nothing right now
	}

});

var timer = new nanoTimer();
var counter = 0;
var countTimeStamp = process.hrtime();
var noteTimeStamp = process.hrtime();
var tickTimeStamp = process.hrtime();
var tickTime = 0;
var timeOffset = '0n'; //nanoseconds
var handleClockTick = function(){
	if(clockCount % 6 == 0){
		clockCount = 0;
		countTimeStamp = process.hrtime();

		if(counter == 1){
			tickTime = process.hrtime(tickTimeStamp);
			tickTime = tickTime[1];
			counter = 0;
		} else {
			tickTimeStamp = process.hrtime();
			counter = 1;
		}

		playNote();
	}
	clockCount++;
}
var playNote = function(){
	if(part.length){
		timer.setTimeout(function(){
			noteTimeStamp = process.hrtime();
			var diff = process.hrtime(noteTimeStamp);
			//console.log(diff);

			noteEvent(part[partStep]);
			partStep++;
			if(partStep >= part.length){
				partStep = 0;
			}
		}, '', timeOffset);
	}
}

var handlePgmin = function(message){
	switch(message[1]){
		case 4:
			return 1;
			break;
		case 3:
			return 2;
			break;
		case 2:
			return 3;
			break;
		case 1:
			return 4;
			break;
		
		/**/
		
		case 8:
			return 5;
			break;
		case 7:
			return 6;
			break;
		case 6:
			return 7;
			break;
		case 5:
			return 8;
			break;
		
		/**/
		
		case 0:
			return 9;
			break;
		case 11:
			return 10;
			break;
		case 10:
			return 11;
			break;
		case 9:
			return 0;
			break;
	}
}

var noteEvent = function(note){
	output.sendMessage([144,note,100]);
		
	timer.setTimeout(noteOff, [note], '15m');
}

var noteOff = function(note){
	output.sendMessage([128,note,0]);
	output.sendMessage([144,note,0]);
}
