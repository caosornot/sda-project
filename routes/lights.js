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
	var result = {
		origen : data[0],
		destino : data[1],
		longitud : data[2],
		payload : [],
		checksum : data[data.length - 1].toString(16)
	}
	for(var i = 3; i<data.length -2; i+=4){
		result.payload[i-3]=data[i]
		if (data[i+1].toString(16) == '20'){result.payload[i-2]='ACK';}
		if (data[i+1].toString(16) == '21'){result.payload[i-2]='ANS';}
		result.payload[i-1]=data[i+2].toString(10);
		result.payload[i]=data[i+3].toString(10);
		var new_read = new Read({
			cmd : result.payload[i-2],
			payload: [result.payload[i]],
			light : result.payload[i-3]
		})
		new_read.save(function(err, light_read){
      if(err){
        console.log(err);
      } else {
        console.log({
          message : "New read saved",
          payload : light_read
        })
      }
    })
	}
	console.log(result)
})

router.get('/control', function (req, res) {
	Read.find(function(err, reads){
		console.log(reads)
		res.render('../views/control',{data : reads});
	})
});

router.get('/data', function (req, res) {
	Read.find(function(err, reads){
		console.log(reads)
		res.render('../views/data',{data : reads});
	})
});

router.post('/control', function (req, res) {
	// console.log(req.body)									//Debug
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
	// console.log(params)						// Debug
	ard.send(params)
	res.render('../views/control');
});

router.post('/lights', function (req, res) {
	if(req.body.light_id && !req.light ==-1){
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


module.exports = router;