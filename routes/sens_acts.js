var express = require('express');
var router = express.Router();
var Arduino = require('../driver/serial_com');

router.get('/set/:id/:value', function(req, res, next){
  var value = parseInt(req.params.value);
  var id = parseInt(req.params.id);
  
  if((id < 255) && (value <= 100)){
    let package = [id ,0x10 , 0, value]
    Arduino.SendData(package);
    res.status = 200;
    res.send({
      message : "The actuator " + id + " as set to value " + value
    })
  }
  else {
    res.status = 500;
    res.send({
      err : "invalid id or value!"
    })
  }
})

router.get('/get/:id', function(req, res, next) {
  var id = req.params.id
  var value = Arduino.pins[req.params.pin].value
  res.send({
    message : "the sensor " + id + " has a value of " + value
  })
});

module.exports = router;