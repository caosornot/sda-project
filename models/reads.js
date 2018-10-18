var mongoose = require('mongoose');

var readSchema = mongoose.Schema({
  timestamp : { type: Date, default: Date.now },
  cmd : {type: String},
  payload: {type: String},
  light : { type: Number, ref: 'Lights' }
});

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


module.exports = mongoose.model('Read', readSchema);
