var nanoTimer = require('nanotimer');
var midi = require('midi');
var output = new midi.output();
var input = new midi.input();


var songs = [
	//0 otters
	[
		[],
		[45, 52, 57, 64],
		[45, 50, 57, 62],
		[45, 52, 57, 64, 69, 76],
		[45, 50, 57, 62, 69, 74],
		[45, 52, 57, 64, 69, 76, 81, 88],
		[45, 50, 57, 62, 69, 74, 81, 86],
	]
];



var clockCount = 0;
var selectedSong = 0;
var partStep = 0;
var selectedPart = 0;
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

	// PGMIN
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
			timeOffset = '0n';
			playNote();
			timeOffset = diff[1]+'n';
		}

	}

	// CC 1
	if(message[0] == 176){
		selectedSong = message[2];
		if(selectedSong >= songs.length){
			selectedSong = songs.length - 1;
		}
	}

});

var timer = new nanoTimer();
var counter = 0;
var countTimeStamp = process.hrtime();
var timeOffset = '0n'; //nanoseconds
var handleClockTick = function(){
	if(clockCount % 6 == 0){
		clockCount = 0;
		countTimeStamp = process.hrtime();
		
		playNote();
	}
	clockCount++;
}
var playNote = function(){
	if(part.length){
		timer.setTimeout(function(){
			noteEvent(part[partStep]);
		}, '', timeOffset);

		partStep++;
		if(partStep >= part.length){
			partStep = 0;
		}
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
