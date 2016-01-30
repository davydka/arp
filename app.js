var midi = require('midi');
var output = new midi.output();
var input = new midi.input();

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

var clockCount = 0;
var stepCount = 0;
input.on('message', function(deltaTime, message) {
	if(message == 250){
		clockCount = 0;
	}
	if(message == 248){
		if(clockCount % 6 == 0){
			clockCount = 0;
			stepCount++;
			
			noteEvent(45);

			/*
			if(stepCount % 0 == 0){
				stepCount = 0;
				console.log('cool');
			}
		       */
		}
	}

	if(message[0] == 194){
		console.log( handlePgmin(message) );
	}

	clockCount++;
});

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
		
		/**/
		
		case 0:
			return 9;
			break;
		case 11:
			return 10;
			break;
		case 10:
			return 9;
			break;
		case 9:
			return 'off';
			break;
	}
	
}

var noteEvent = function(note){
	output.sendMessage([144,note,100]);

	setTimeout(function(note){
		output.sendMessage([128,note,0]);
	}, 15)
}

