var http = require("http");
var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
});

http.createServer(function(req, res){ // http.createServer([requestListener]) | The requestListener is a function which is automatically added to the 'request' event.
    var parts = req.url.split("/"), // split request url on "/" character
    operator1 = parseInt(parts[1],10), // 10 is radix - decimal notation; the base in mathematical numeral systems (from 2 to 36)
    operator2 = parseInt(parts[2],10); // 10 is radix - decimal notation;
    if (operator1 == 0) {
     console.log("Putting led to OFF");
     board.digitalWrite(13, board.LOW);
    }
    if (operator1 == 1) {
    console.log("Putting led ON");
     board.digitalWrite(13, board.HIGH);
    }
    if (operator2 == 0) {
    console.log("Putting led OFF");
     board.digitalWrite(8, board.LOW);
    }
    if (operator2 == 1) {
    console.log("Putting led ON");
    board.digitalWrite(8, board.HIGH);
    }
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("for test write into browser line: http://172.16.22.224:8080/1\n");
    res.end("The value of operator: " + operator1);
}).listen(8080, "172.16.22.224");

