var express = require('express');           //Web framework for node http://expressjs.com/      
var path = require('path');                 //Provides utilities for working with file and directory paths
var logger = require('morgan');             //HTTP request logger https://www.npmjs.com/package/morgan
var bodyParser = require('body-parser');    //Node.js body parsing middleware.https://www.npmjs.com/package/body-parser
var mongoose = require('mongoose');

var app = express();
var port = 8000;

// Configuracion de MongoDB
mongoose.Promise = global.Promise;
mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost:27017/lights_db", { useNewUrlParser: true })
    .then(() => {
        console.log("La conexión a la base de datos lights_db se ha realizado correctamente")

        // Ejecutar servidor en localhost puerto 8000
        app.listen(port, () => {
            console.log("Servidor corriendo en http://localhost:8000");
        });
    })
    .catch(err => console.log(err));

// Especificacion de ruta de carpeta publica
app.use(express.static(path.join(__dirname, 'public')));
// Indicar ruta y motor ejs para pagina web
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Uso de bodyparser JSON y URLEncoded para tratar información de los request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Logger para debugear y observar peticiones
app.use(logger('common'));

var index = require('./routes/index')
app.use('/', index)
