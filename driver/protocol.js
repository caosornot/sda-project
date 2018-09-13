// CODIGO PARA ENVIO DE STREAM DE DATOS
// Armar trama de datos y envio por puerto serial


const Buffer = require('safe-buffer').Buffer

class Protocol{

    constructor(){
        buffer = new Buffer(40);
    }
    

    packData(ID, command, i_msb, i_lsb){
        if(cursor<40){
            buffer[cursor] = ID; cursor++;
            buffer[cursor] = command; cursor++;
            buffer[cursor] = i_msb; cursor++;
            buffer[cursor] = i_lsb; cursor++;
            return true;
        }
        return false;
    }

    clearBuffer(){
        for(let i=0; i<40; i++) {
            buffer[i] = 0;
        }
        cursor = 0;
    }
  
    calCheckSum(){
        var sum = 0;
        for(let i = 0; i< cursor; i++){
            sum += buff[i];
        }
        sum &= 0b0000000011111111;
        return sum = 0xFF - sum;       
    }
    
    sendData(SPort, dest){
        SPort.write(0x7E);
        SPort.write(0x01);
        SPort.write(dest);
        SPort.write(cursor);
        for(var i=0;i<cursor;i++){
            SPort.write(buffer[i]);
        }
        SPort.write(calCheckSum());
        clearBuffer();
    }

}

module.exports = Protocol