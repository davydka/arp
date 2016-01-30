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
input.on('message', function(deltaTime, message) {
	if(message == 250){
		clockCount = 0;
	}
	if(message == 248){
		if(clockCount % 6 == 0){
			clockCount = 0;
			console.log('cool');
		}
	}

	clockCount++;
});


var noteEvent = function(note){
	output.sendMessage([144,note,100]);

	setTimeout(function(note){
		output.sendMessage([128,note,0]);
	}, 35)
}

