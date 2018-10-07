var express = require('express');           //Web framework for node http://expressjs.com/      
var path = require('path');                 //Provides utilities for working with file and directory paths
var logger = require('morgan');             //HTTP request logger https://www.npmjs.com/package/morgan
var bodyParser = require('body-parser');    //Node.js body parsing middleware.https://www.npmjs.com/package/body-parser

var SerialPort = require('serialport')
var RawParser = require('./driver/RawParser')

var port = new SerialPort('COM9', {
  baudRate: 9600
});

parser = port.pipe(new Protocol())

var app = express();


