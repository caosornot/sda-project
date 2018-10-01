var SerialPort = require('serialport')
var RawParser = require('./RawParser')
var readline = require('readline');

var port = new SerialPort('COM15', {
    baudRate: 9600
});

parser = port.pipe(new RawParser())

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else {
        data = [0x14, 0x10, 0x11, 0x00];
        SendData(data);
    }
  });

parser.on('data', function(data){
    console.log(data)
    var result = {
      origen : data[0].toString(16),
      destino : data[1].toString(16),
      longitud : data[2],
      payload : {},
      checksum : data[data.length - 1].toString(16)
    }
    for(var i = 3; i<data.length -2; i+=4){
      var buf = Buffer.from([data[i+1], data[i+3]]);
      result.payload[data[i].toString(16)] = buf.readInt16BE(0);
    }
    console.log(result)
  })

exports.SendData = function (package){
    var sum = 0;
    for(var i = 0; i< package.length; i++){
        sum += package[i];
    }
    sum &= 0b0000000011111111;
    sum = 0xFF - sum;

    port.write(0x7E);
    port.write(0x01);
    port.write(0x02);
    port.write(package.length);
    for(var i = 0; i<package.length; i++){
        port.write(package[i]);
    }
    port.write(sum);
}
