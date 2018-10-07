var SerialPort = require('serialport')
var RawParser = require('./RawParser')
var events = require('events')

class ArduinoDriver extends events.EventEmitter  {

    constructor(params) {
        super(params)
        this.port = new SerialPort(params.port, {
            baudRate : params.baudRate
        })
        this.parser = this.port.pipe(new RawParser())
        this._init();
    }

    _init() {
        var th = this;
        this.port.on('open', function(){
            console.log("Port open at:")
        })
        this.parser.on('data', function(data) {
            th.emit('data', data)
        })
    }

    // parser.on('data', function(data){
    //     console.log(data)
    //     var result = {
    //     origen : data[0].toString(16),
    //     destino : data[1].toString(16),
    //     longitud : data[2],
    //     payload : {},
    //     checksum : data[data.length - 1].toString(16)
    //     }
    //     for(var i = 3; i<data.length -2; i+=4){
    //     var buf = Buffer.from([data[i+1], data[i+3]]);
    //     result.payload[data[i].toString(16)] = buf.readInt16BE(0);
    //     }
    //     console.log(result)
    // }

    send(params){
        
        // 0x7E 0x01 0x02 0x04 0x0A 0x01 0x00 0x50 0xA4
        var pack = new Buffer([0x7E, params.origin, params.destination, 0]);
        params.payload.forEach(function(element) {
            var buff = new Buffer([0,0,0,0])
            buff[0] = element.id
            buff[1] = element.cmd
            buff.writeUInt16BE(element.payload, 2)
            pack = Buffer.concat([pack, buff])
            pack[3] += 4;
        });
        var sum = 0;
        for(var i = 4; i < 4 + pack[3]; i++) {
            sum += pack[i];
        }
        sum &= 0b0000000011111111;
        sum = 0xFF - sum;
        pack = Buffer.concat([pack, new Buffer([sum])])
        this.port.write(pack)
        console.log(pack)
    }
}

// {
//     origin : 0xAA,
//     destination : 0xBB,
//     payload : [
//         {
//             id: 0xA1,
//             cmd : 0xA0,
//             data: 0xAAFF
//         }
//     ]
// }

// {
//     id : 0x0A
//     cmd : 0xAb
//     data: ABC;
// }

module.exports = ArduinoDriver