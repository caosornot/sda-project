var ArduinoDriver = require('./driver/serial-test')

var ard = new ArduinoDriver({
    port: 'COM24',
    baudRate : 9600
})

setTimeout(function() {
    var params = {
        origin : 0x01,
        destination : 0x02,
        payload : [
            {
                id : 0x0A,
                cmd : 0x01,
                payload : 0x0050,
            }
        ]
    }
    ard.send(params)
}, 1000);

ard.on('data', function(data) {
    console.log(data)
})