var http = require("http").createServer(handler);
var io = require("socket.io").listen(http); // socket.io for permanent connection between server and client
var fs = require("fs"); //var for file system
var firmata = require("firmata");
var desiredValue = 0; // desired value var
var actualValue = 0; // variable for actual value (output value)
var factor = -0.1; // proportional factor that determines the speed of aproaching toward desired value
var controlAlgorihtmStartedFlag = 0; // flag in global scope to see weather ctrlAlg has been started
var intervalCtrl; // var for setInterval in global space

// PID Algorithm variables
var Kp = 0.055; // proportional factor
var Ki = 0.0008; // integral factor
var Kd = 0.015; // differential factor
var pwm = 0;
var pwmLimit = 254;

var err = 0; // variable for second pid implementation
var errSum = 0; // sum of errors
var dErr = 0; // difference of error
var lastErr = 0; // to keep the value of previous error

var sendValueViaSocket = function() {}; // function to send message over socket
var sendStaticMsgViaSocket = function() {}; // function to send static message over socket


console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){ // ACM Abstract Control Model for serial communication with Arduino (could be USB)
    console.log("Connect to Arduino");
    console.log("Enabling analog Pin 0");
    board.pinMode(0, board.MODES.ANALOG); // analog pin 0
    console.log("Enabling analog Pin 1");
    board.pinMode(1, board.MODES.ANALOG); // analog pin 1
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
    board.pinMode(3, board.MODES.PWM); // PWM of motor i.e. speed of rotation
    board.pinMode(4, board.MODES.OUTPUT); // direction DC motor
});

function controlAlgorithm (parameters) {
    if (parameters.ctrlAlgNo == 1) {
        pwm = parameters.pCoeff*(desiredValue-actualValue);
        if(pwm > pwmLimit) {pwm = pwmLimit}; // to limit the value for pwm / positive
        if(pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit the value for pwm / negative
        if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // določimo smer če je > 0
        if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // določimo smer če je < 0
        board.analogWrite(3, Math.round(Math.abs(pwm)));
        console.log(Math.round(pwm));
    }
    if (parameters.ctrlAlgNo == 2) {
        err = desiredValue - actualValue; // error
        errSum += err; // sum of errors, like integral
        dErr = err - lastErr; // difference of error
        pwm = parameters.Kp1*err + parameters.Ki1*errSum + parameters.Kd1*dErr;
        lastErr = err; // save the value for the next cycle
        if(pwm > pwmLimit) {pwm = pwmLimit}; // to limit the value for pwm / positive
        if(pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit the value for pwm / negative
        if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // določimo smer če je > 0
        if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // določimo smer če je < 0
        board.analogWrite(3, Math.round(Math.abs(pwm)));
    }
};

function startControlAlgorithm (parameters) {
    if (controlAlgorihtmStartedFlag == 0) {
        controlAlgorihtmStartedFlag = 1; // set flag that the algorithm has started
        intervalCtrl = setInterval(function() {controlAlgorithm(parameters); }, 30); // na 30ms klic
        console.log("Control algorithm " + parameters.ctrlAlgNo + " started");
        sendStaticMsgViaSocket("Control algorithm " + parameters.ctrlAlgNo + " started | " + json2txt(parameters));
    }
};

function stopControlAlgorithm () {
    clearInterval(intervalCtrl); // clear the interval of control algorihtm
    board.analogWrite(3,0); // write 0 on pwm pin to stop the motor
    controlAlgorihtmStartedFlag = 0; // set flag that the algorithm has stopped
    pwm=0;
    console.log("ctrlAlg STOPPED");
    sendStaticMsgViaSocket("Stop");
};

function handler (req,res) {
    fs.readFile(__dirname+"/example18.html",
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
    "actualValue": actualValue,
    "pwm": pwm,
    "err": err,
    "errSum": errSum,
    "dErr": dErr
    });
};


board.on("ready", function() {
    io.sockets.on('connection', function(socket) {  // from bracket ( onward, we have an argument of the function on -> at 'connection' the argument is transfered i.e. function(socket)
        socket.emit("messageToClient", "Server connected, board ready.");
        socket.emit("staticMsgToClient", "Server connected, board ready.")
        setInterval(sendValues, 40, socket); // na 40ms we send message to client
        
        socket.on("startControlAlgorithm", function(numberOfControlAlgorithm){
            startControlAlgorithm(numberOfControlAlgorithm);
        });

    
        socket.on("stopControlAlgorithm", function(){
            stopControlAlgorithm();
        });
        
    }); // end of socket
        
    
    board.analogRead(0, function(value) {
        desiredValue = value; // continuous read of pin A0
    });
    
    board.analogRead(1, function(value) {
        actualValue = value; // continuous read of pin A1
    });
    
    sendValueViaSocket = function (value) {
    io.sockets.emit("messageToClient", value);
    }
        
    sendStaticMsgViaSocket = function (value) {
        io.sockets.emit("staticMsgToClient", value);
    }
    
});

function json2txt(obj) // function to print out the json names and values
{
  var txt = '';
  var recurse = function(_obj) {
    if ('object' != typeof(_obj)) {
      txt += ' = ' + _obj + '\n';
    }
    else {
      for (var key in _obj) {
        if (_obj.hasOwnProperty(key)) {
          txt += '.' + key;
          recurse(_obj[key]);
        } 
      }
    }
  };
  recurse(obj);
  return txt;
}