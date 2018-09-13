var express = require('express');           //Web framework for node http://expressjs.com/      
var path = require('path');                 //Provides utilities for working with file and directory paths
var logger = require('morgan');             //HTTP request logger https://www.npmjs.com/package/morgan
var bodyParser = require('body-parser');    //Node.js body parsing middleware.https://www.npmjs.com/package/body-parser

var SerialPort = require('serialport')
var RawParser = require('./driver/raw_parser')

var port = new SerialPort('COM9', {
  baudRate: 9600
});
parser = port.pipe(new RawParser())

var app = express();

parser.on('data', function(data){
  //console.log(data)
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
