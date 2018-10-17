var express = require('express');
var router = express.Router();
var ArduinoDriver = require('../driver/serial_com')
var Light = require('../models/lights')
var Read = require('../models/reads')

var ard = new ArduinoDriver({
    port: 'COM24',
    baudRate : 9600
})

ard.on('data', function(data) {
	console.log(data)
	
})

router.post('/control', function (req, res) {
	//console.log(req.body)									//Debug
	var params = {
		origin : 0x01,
		destination : 0x02,
		payload : [
				{
						id : 0x00,
						cmd : 0x00,
						payload : 0x0000,
				}
		]
	}
	params.payload[0].id = parseInt(req.body.VId)
	if (req.body.VCommand=='Set') {
		params.payload[0].cmd	= 0X01
		params.payload[0].payload = params.payload[0].payload|parseInt(req.body.VValue)
	} 
	if (req.body.VCommand=='Get') {
		params.payload[0].cmd	= 0X10
		params.payload[0].payload = 0X1100
	} 
	//console.log(params)						// Debug
	ard.send(params)
	res.render('../views/control');
});

router.post('/lights', function (req, res) {
	if(req.body.light_id && !req.light && req.body.light_id.indexOf(" ")==-1){
	  var dev = new Light({
		light_id : req.body.light_id,
		zone : req.body.zone || null,
		type_device : req.body.type_device || null,
		description : req.body.description || null
	  })
	  dev.save(function(err, light){
		if(err){
		  res.send(err);
		} else {
			res.render('../views/lights');
			// Adicionar PopUp
		}  
	  })
	} else {
	  res.status = 400;
	  res.send({
		message : "invalid requests"
	  })
	}
  });

	router.delete('/lights', Light.findDevice, Read.findByDevice, function(req, res, next){
		if(req.device){
			req.device.remove(function(err, device){
				if(err){
					res.send(err)
				} else {
					Read.deleteMany({device : req.device._id}, null)
					res.send({
						message : "Device removed",
						payload : device
					})
				}
			})
		} else {
			res.status = 404
			res.send({
				message: "Device not found"
			})
		}
	});

// router.get('/set/:id/:value', function(req, res, next){
//   var value = parseInt(req.params.value);
//   var id = parseInt(req.params.id);
  
//   if((id < 255) && (value <= 100)){
//     let package = [id ,0x10 , 0, value]
//     Arduino.SendData(package);
//     res.status = 200;
//     res.send({
//       message : "The actuator " + id + " as set to value " + value
//     })
//   }
//   else {
//     res.status = 500;
//     res.send({
//       err : "invalid id or value!"
//     })
//   }
// })

// router.get('/get/:id', function(req, res, next) {
//   var id = req.params.id
//   var value = Arduino.pins[req.params.pin].value
//   res.send({
//     message : "the sensor " + id + " has a value of " + value
//   })
// });

module.exports = router;