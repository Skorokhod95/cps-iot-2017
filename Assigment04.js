var http = require("http").createServer(handler); // on req - handler - function to handle events
var io = require("socket.io").listen(http); // socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // pin13 as out
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // pin13 as out
    console.log("Activation of Pin 2");
    board.pinMode(2, board.MODES.OUTPUT); // pin13 as out
    console.log("Activation of Pin 4");
    board.pinMode(4, board.MODES.OUTPUT); // pin13 as out
});

// we should define handler function which is an argument in the first line
// to specify how events are handled
// handler is similar function as in example01.js -> http.createServer(function(req, res){...
function handler(req, res) {
    fs.readFile(__dirname + "/assigment04.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
    res.writeHead(200);
    res.end(data);
    })
}

var timer1;
var timer2;
var timer3;
var timer4;

http.listen(8080); // server will listen on port 8080

io.sockets.on("connection", function(socket) {
    socket.on("commandToArduino", function(commandNo){
        if (commandNo == "1") {
            board.digitalWrite(13, board.HIGH); // write high on pin 13
        }
        if (commandNo == "0") {
            board.digitalWrite(13, board.LOW); // write low on pin 13
        }
        if (commandNo == "3") {
            board.digitalWrite(8, board.HIGH); // write high on pin 13
        }
        if (commandNo == "2") {
            board.digitalWrite(8, board.LOW); // write low on pin 13
        }
        if (commandNo == "5") {
            board.digitalWrite(4, board.HIGH); // write high on pin 13
        }
        if (commandNo == "4") {
            board.digitalWrite(4, board.LOW); // write low on pin 13
        }
        if (commandNo == "7") {
            board.digitalWrite(2, board.HIGH); // write high on pin 13
        }
        if (commandNo == "6") {
            board.digitalWrite(2, board.LOW); // write low on pin 13
        }
        if (commandNo == "9") {
            board.digitalWrite(4, board.HIGH); // write high on pin 13
             board.digitalWrite(2, board.HIGH); // write high on pin 13
              board.digitalWrite(8, board.HIGH); // write high on pin 13
               board.digitalWrite(13, board.HIGH); // write high on pin 13
        }
        if (commandNo == "8") {
            board.digitalWrite(4, board.LOW); // write low on pin 13
            board.digitalWrite(2, board.LOW); // write low on pin 13
            board.digitalWrite(8, board.LOW); // write low on pin 13
            board.digitalWrite(13, board.LOW); // write low on pin 13
        }
    });
 
  /*socket.on("blinkOn", function(){
    timer1 = setInterval(function () {board.digitalWrite(13, board.HIGH);}, 500);
    timer2 = setInterval(function () {board.digitalWrite(13, board.LOW);}, 800);
    timer3 = setInterval(function () {board.digitalWrite(8, board.HIGH);}, 650);
    timer4 = setInterval(function () {board.digitalWrite(8, board.LOW);}, 950);
    });
    socket.on("blinkOff", function(){
        clearInterval(timer1);
        clearInterval(timer2);
    board.digitalWrite(13, board.LOW);
        clearInterval(timer3);
        clearInterval(timer4);
    board.digitalWrite(8, board.LOW);
    });*/


});