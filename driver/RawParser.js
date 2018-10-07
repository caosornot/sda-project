// CODIGO PARA RECEPCIÓN DE STREAM DE DATOS
// Identifica header, y a partir de este separa direcciones, longitud
// y paquete de datos

const Buffer = require('safe-buffer').Buffer
const Transform = require('stream').Transform

class RawParser extends Transform {
    constructor (options) {
      options = options || {}
      super(options)
      this.buffer = Buffer.alloc(0)         //Buffer.alloc(size[, fill[, encoding]] Allocates a new Buffer of size bytes.
    }
  _transform (chunk, encoding, cb) {        //https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
    
    let data = Buffer.concat([this.buffer, chunk])    //"let" declara una variable en ambito local
    let parser = {
      pos: null,
      len: null,
      payload : null
    }

    if ((parser.pos = data.indexOf(0x7E)) !== -1) {
      // Lectura de longitud y contenido de paquete de datos
      parser.len = data[parser.pos + 3];
      parser.payload = data.slice(parser.pos + 1,  (parser.pos + 5 + parser.len))

      // Comparación del tamaño del payload con la longitud recibida en la trama
      if(parser.payload.length == parser.len + 4){    
        // Creación de buffer para paquete de datos
        var buff = new Buffer(parser.len)
        // Copia unicamente de paquete de datos en variable buff
        parser.payload.slice(3, parser.payload.length-1).copy(buff);
        // Calculo de Checksum
        var sum = 0;
        for(var i = 0; i< buff.length; i++){
            sum += buff[i];
        }
        sum &= 0b0000000011111111;
        sum = 0xFF - sum;

        // Comparación de Checksum calculado con recibido
        if(sum == parser.payload[parser.payload.length-1]){
          this.push(parser.payload);
        }
      }
    }
    this.buffer = data
    cb()
  }
  _flush (cb) {           //https://nodejs.org/api/stream.html#stream_transform_flush_callback
    this.push(this.buffer)
    this.buffer = Buffer.alloc(0)
    cb()
  }

}

module.exports = RawParser