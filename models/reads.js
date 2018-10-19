var mongoose = require('mongoose');

//Definir Esquema de Lectura de Datos
var readSchema = mongoose.Schema({
  timestamp : { type: Date, default: Date.now },
  cmd : {type: String},
  payload: {type: String},
  light : { type: Number, min: 0, max: 255 }
});

//Definicion de metodo estatico para buscar lecturas por ID de dispositivo
readSchema.statics.findByDevice = function(req, res, next){
  if(req.device){
    mongoose.model('Read').find({device : req.device._id}, function(err, data){
      if(err){
        next(err)
      } else {
        req.reads = data;
        next();
      }
    })
  } else {
    next();
  }
}

// Creacion de modelo a partir de esquema
module.exports = mongoose.model('Read', readSchema);
