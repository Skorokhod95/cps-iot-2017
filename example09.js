var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); // socket.io for permanent connection between server and client
var fs = require("fs"); //var for file system
var firmata = require("firmata");
//var socket = io.connect("172.16.22.224:8080"); // create socket - connect to it

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connecting to Arduino");
    console.log("Enabling Push Button on pin 2");
    board.pinMode(2, board.MODES.INPUT);
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // Configures the specified pin to behave either as an input or an output.
});


function handler (req,res) {
    fs.readFile(__dirname+"/example09.html",
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

var clientIpAddress=0;
var sendValueViaSocket =function(){};

board.on("ready", function() {
    io.sockets.on("connection", function(socket) {
        console.log("Socket id: "+socket.id);
        // print of IP adresses, ports, ip family
        clientIpAddress = socket.request.socket.remoteAddress;
        io.sockets.emit("messageToClient", "socket.request.socket.remoteAddress: " + socket.request.socket.remoteAddress);
        // ::ffff:192.168.254.1 is ipv6 address
        // in Chrome we enter: http://[::ffff:192.168.254.131]:8080 -> http://[::ffff:c0a8:fe83]:8080
        io.sockets.emit("messageToClient", "socket.request.connection._peername.family: " + socket.request.connection._peername.family);
        io.sockets.emit("messageToClient", "socket.request.connection._peername.port: " + socket.request.connection._peername.port);
        io.sockets.emit("messageToClient", "socket.id: " + socket.id);
        // extract ipv4 address ->
        var idx = clientIpAddress.lastIndexOf(':');
        var address4;
        if (~idx && ~clientIpAddress.indexOf('.')) address4 = clientIpAddress.slice(idx + 1);
        io.sockets.emit("messageToClient", "ipv4 address: " + socket.request.socket.remoteAddress);
        io.sockets.emit("messageToClient", "Client data ----------------------------->");
        
        
        sendValueViaSocket =function(value) {
            io.sockets.emit("messageToClient", "Value = " + value);
           // divPrint1.log(value);
        }
        
    });
        
            var timeout = false;
            var last_sent=0;
            var last_value=0;
            
    board.digitalRead(2, function(value) { // this happens many times on digital input change of state 0->1 or 1->0
        if (timeout !== false) { // if timeout below has been started (on unstable input 0 1 0 1) clear it
    	   clearTimeout(timeout); // clears timeout until digital input is not stable i.e. timeout = false
        }
        timeout = setTimeout(function() { // this part of code will be run after 50 ms; if in-between input changes above code clears it
            console.log("Timeout set to false");
            timeout = false;
            if (last_value != last_sent) { // to send only on value change
            	if (value == 0) {
                    console.log("LED OFF");
                    board.digitalWrite(13, board.LOW);
                    console.log("value = 0, LED OFF");
                }
                else if (value == 1) {
                    console.log("LED ON");
                    board.digitalWrite(13, board.HIGH);
                    console.log("value = 1, LED lit");
                }
                sendValueViaSocket(value);
            }
    
            last_sent = last_value;
        }, 750); // execute after 750ms
                    
        last_value = value; // this is read from pin 2 many times per s
                    
    }); // end board.digitalRead on pin 2
    
});

