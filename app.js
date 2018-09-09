var SerialPort = require('serialport')
var RawParser = require('./raw_parser')
//var readline = require('readline');

var port = new SerialPort('COM9', {
  baudRate: 9600
});
parser = port.pipe(new RawParser())

/* readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
  }
});
console.log('Press any key...');  */

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
