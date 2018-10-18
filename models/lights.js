var mongoose = require('mongoose');

//Definir Esquema de Sistema de Luces
var lightsSchema = mongoose.Schema({
  id_device: {type : Number,  min: 0, max: 255},
  zone : {type : String, uppercase : true},
  type_device : {type : String , uppercase : true},
  description : {type : String , uppercase : true},
});
//Definicion de metodo estatico para buscar tipo de dispositivo por ID
lightsSchema.statics.findDevice = function(req, res, next){
  mongoose.model('Lights').findOne({light_id: req.body.light_id || req.params.light_id}, function(err, device){
    if(err){
      next(err);
    } else {
      req.device = device;
      next();
    }
  });
}
//Definicion de metodo estatico para buscar por zona
lightsSchema.statics.findByZone = function(req, res, next){
  mongoose.model('Lights').findOne({zone: req.body.zone || req.params.zone}, function(err, zone){
    if(err){
      next(err);
    } else {
      req.zone = zone;
      next();
    }
  });
}
// Crear modelo a partir de esquema
module.exports = mongoose.model('Lights', lightsSchema);