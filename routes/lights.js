var express = require('express');
var router = express.Router();
var ArduinoDriver = require('../driver/serial_com')
var Light = require('../models/lights')
var Read = require('../models/reads')

// Inicializa comunicación con Arduino por Serial
var ard = new ArduinoDriver({
    port: 'COM24',
    baudRate : 9600
})

// Recepción de datos de Arduino por serial y almacenamiento en MongoDB Model-Read
ard.on('data', function(data) {
	// console.log(data)
	// Definición de estructura de datos recibidos
	var result = {
		origen : data[0],
		destino : data[1],
		longitud : data[2],
		payload : [],
		checksum : data[data.length - 1].toString(16)
	}
	// Interpretación de Payload para mi protocolo
	for(var i = 3; i<data.length -2; i+=4){
		result.payload[i-3]=data[i]
		if (data[i+1].toString(16) == '20'){result.payload[i-2]='ACK';}
		if (data[i+1].toString(16) == '21'){result.payload[i-2]='ANS';}
		result.payload[i-1]=data[i+2].toString(10);
		result.payload[i]=data[i+3].toString(10);
		// Creación de objeto en DB
		var new_read = new Read({
			cmd : result.payload[i-2],
			payload: [result.payload[i]],
			light : result.payload[i-3]
		})
		// Guardar modelo en DB
		new_read.save(function(err, light_read){
      if(err){
        console.log(err);
      } else {
        console.log({
          message : "New read saved",
        //   payload : light_read
        })
      }
    })
	}
	// console.log(result)
})

// Petición GET a pagina de Control
router.get('/control', function (req, res) {
	// Recopilacion de Lecturas (Read) y Dispositivos (Light), para ingresar como 
	// variables al render y desplegar información en pagina web
	Read.find(function(err, reads){
		Light.find(function(err, devices){	// console.log(reads)
		res.render('../views/control',{data : reads, device : devices});
		})
	})
});

// Petición GET a pagina de Dispositivos
router.get('/lights', function (req, res) {
	// Recopilacion de Dispositivos (Light), para ingresar como 
	// variables al render y desplegar información en pagina web
	Light.find(function(err, devices){
		//console.log(devices)
		res.render('../views/lights',{data : devices});
	})
});

// Petición GET a pagina de Datos Historicos
router.get('/data', function (req, res) {
	// Recopilacion de Lecturas (Read), para ingresar como 
	// variables al render y desplegar información en pagina web
	Read.find(function(err, reads){
		// console.log(reads)
		res.render('../views/data',{data : reads});
	})
});

// Petición POST a pagina de Control, cuando realizan Send en pagina web a envio de comandos
router.post('/control', function (req, res) {
	// console.log(req.body)
	// Creacion de estructura de parametros a enviar al arduino
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
	// Conversión y asignación de parametros en estructura params
	params.payload[0].id = parseInt(req.body.VId.substr(0,3))
	if (req.body.VCommand=='Cambiar') {
		params.payload[0].cmd	= 0X01
		params.payload[0].payload = params.payload[0].payload|parseInt(req.body.VValue)
	} 
	if (req.body.VCommand=='Leer') {
		params.payload[0].cmd	= 0X10
		params.payload[0].payload = 0X1100
	} 
	// console.log(params)						// Debug
	// Envio de params al Arduino
	ard.send(params)
	// Recopilacion de Lecturas (Read) y Dispositivos (Light), para ingresar como 
	// variables al render y desplegar información en pagina web
	Read.find(function(err, reads){
		Light.find(function(err, devices){	// console.log(reads)
		res.render('../views/control',{data : reads, device : devices});
		})
	})
});

// Petición POST a pagina de Dispostivos, cuando realizan Crear dispositivos en pagina web 
router.post('/lights', function (req, res) {
	// console.log(req.body)
	// Creacion de dispositivo en DB
	var dev = new Light({
	id_device : parseInt(req.body.DeviceId),
	zone : req.body.Zone,
	type_device : req.body.TypeDevice,
	description : req.body.Description
	})
	// Guardar Dispositivo en DB
	dev.save(function(err, light){
	if(err){
		res.send(err);
	} else {
		// Recopilacion de Dispositivos (Light), para ingresar como 
		// variables al render y desplegar información en pagina web
		Light.find(function(err, devices){
			//console.log(devices)
			res.render('../views/lights',{data : devices});
		})
	}  
	})

});

module.exports = router;