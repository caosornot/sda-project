var SerialPort = require('serialport')
var RawParser = require('./RawParser')
var events = require('events')

class ArduinoDriver extends events.EventEmitter  {

    constructor(params) {
        super(params)
        this.port = new SerialPort(params.port, {
            baudRate : params.baudRate
        })
        // Especificación de RawParse
        this.parser = this.port.pipe(new RawParser())
        this._init();
    }

    _init() {
        var th = this;
        this.port.on('open', function(){
            console.log("Port open at:")
        })
        // Emicion de evento cuando se reciba tramas desde el Arduino
        this.parser.on('data', function(data) {
            th.emit('data', data)
        })
    }
    // Metodo para envio de trama de datos al arduino de acuerdo a protocolo propio
    send(params){
        
        // 0x7E 0x01 0x02 0x04 0x0A 0x01 0x00 0x50 0xA4
        // Creacion de Buffer para envio por puerto serial, con estructura de protocolo propio
        var pack = new Buffer([0x7E, params.origin, params.destination, 0]);
        // Asignación en buffer de payload
        params.payload.forEach(function(element) {
            var buff = new Buffer([0,0,0,0])
            buff[0] = element.id
            buff[1] = element.cmd
            buff.writeUInt16BE(element.payload, 2)
            // Concatenar Buffer con payload organizado
            pack = Buffer.concat([pack, buff])
            pack[3] += 4;
        });
        //Calculo de Checksum
        var sum = 0;
        for(var i = 4; i < 4 + pack[3]; i++) {
            sum += pack[i];
        }
        sum &= 0b0000000011111111;
        sum = 0xFF - sum;
        pack = Buffer.concat([pack, new Buffer([sum])])
        // Envio por puerto serial
        this.port.write(pack)
        //console.log(pack)
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