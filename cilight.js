if (!process.env.DEBUG) {
    var wpi = require('wiring-pi');
    wpi.setup();
    for (var pin = 0; pin <= 7; pin++) {
        // Set all pins on OUTPUT mode
        wpi.pinMode(pin, wpi.OUTPUT);
    }
}

// WiringPi numbers for the lights
const GREEN = 0;
const ORANGE = 1;
const RED = 2;

// WiringPi states
const ON = 0;
const OFF = 1;

// Build status
const FAILED = 'failed';
const BUSY = 'busy';
const SUCCESFUL = 'successful'

var blinkValue = 0;
var blinkInterval = null;
var jobStatus = [];

exports.failed = function (response) {
    jobStatus[response.url] = FAILED;
    stateChanged();
};
exports.successfull = function (response) {
    jobStatus[response.url] = SUCCESFUL;
    stateChanged();
};
exports.started = function (response) {
    jobStatus[response.url] = BUSY;
    stateChanged();
};

// Change light state based on job status
function stateChanged() {

    var greenLight = ON;
    var orangeLight = OFF;
    var redLight = OFF;

    for (var jobName in jobStatus) {

        console.log(jobName + ': ' + jobStatus[jobName]);
        switch (jobStatus[jobName]) {
            case FAILED:
                redLight = ON;
                greenLight = OFF;
                break;
            case BUSY:
                orangeLight = ON;
                greenLight = OFF;
                break;
            case SUCCESFUL:
                // Green is on by default
                break;
        }
    }

    switchLight(GREEN, greenLight);
    switchLight(ORANGE, orangeLight);
    switchLight(RED, redLight);
}

function switchLight(number, state) {
    console.log('Switch relay ' + number + ' to state ' + state);

    if (!process.env.DEBUG) {
        wpi.digitalWrite(number, state);
    }
};

function stopBlink() {
    console.log('Stop blink interval');
    clearInterval(blinkInterval);
}
function blinkLight(number) {

    console.log('Blink relay ' + number);

    blinkInterval = setInterval(function() {
        console.log('Blink ' + number + ' to state ' + blinkValue);
        if (!process.env.DEBUG) {
            wpi.digitalWrite(number, blinkValue);
        }
        blinkValue = +!blinkValue;
    }, 600);
}
