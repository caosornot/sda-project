var express = require('express');           //Web framework for node http://expressjs.com/      
var path = require('path');                 //Provides utilities for working with file and directory paths
var logger = require('morgan');             //HTTP request logger https://www.npmjs.com/package/morgan
var bodyParser = require('body-parser');    //Node.js body parsing middleware.https://www.npmjs.com/package/body-parser
var ArduinoDriver = require('./driver/serial_com')

var ard = new ArduinoDriver({
    port: 'COM24',
    baudRate : 9600
})

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('common'));

var index = require('./routes/index')

app.use('/', index)

ard.on('data', function(data) {
  console.log(data)
})

app.listen(8000);
console.log('8000 is the magic port');