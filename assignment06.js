var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); // socket.io for permanent connection between server and client
var fs = require("fs"); //var for file system
var firmata = require("firmata");
//var socket = io.connect("172.16.22.224:8080"); // create socket - connect to it
var desiredValue = 0; // desired value var
var actualValue = 0; // variable for actual value (output value)


console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connect to Arduino");
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
    console.log("Enabling analog Pin 1");
    board.pinMode(1, board.MODES.ANALOG); // analog pin 1
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 12");
    board.pinMode(12, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
});


function handler (req,res) {
    fs.readFile(__dirname+"/assignment06.html",
    function(err,data) {
        if (err) {
            res.writeHead(500,{"Content-Type":"text/plain"});
            return res.end("Error loading html page.");
        }
        res.writeHead(200);
        res.end(data);
    });
}


http.listen(8080);

function sendValues (socket) {
    socket.emit("clientReadValues",
    { // json notation between curly braces
    "desiredValue": desiredValue,
    "actualValue": actualValue
    });
};


board.on("ready", function() {
    io.sockets.on('connection', function(socket) {  // from bracket ( onward, we have an argument of the function on -> at 'connection' the argument is transfered i.e. function(socket)
        socket.emit("messageToClient", "Server connected, board ready.");
        setInterval(sendValues, 40, socket); // na 40ms we send message to client
        console.log("Putting led ON");
    }); // end of socket
        
    
    board.analogRead(0, function(value) {
        desiredValue = value; // continuous read of pin A0
        if (actualValue>desiredValue) {
            board.digitalWrite(8, board.HIGH);
        }
        else {
            board.digitalWrite(8, board.LOW);
        }
        
        if (actualValue==desiredValue) {
            board.digitalWrite(12, board.HIGH);
        }
        else {
            board.digitalWrite(12, board.LOW);
        }
        
    });
    
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
        if (actualValue<desiredValue) {
            board.digitalWrite(13, board.HIGH);
        }
        else {
            board.digitalWrite(13, board.LOW);
        }
    });
    
    
    
});

