// Módulos
var express = require('express');
var app = express();

var crypto = require('crypto');

var mongo = require('mongodb');
var swig  = require('swig');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

app.set('port', 8081);
app.set('db','mongodb://admin:b4nc4pr0j3ct!@ds237445.mlab.com:37445/bancaproject');
app.set('clave','abcdefg');
app.set('crypto',crypto);

// lanzar el servidor
app.listen(app.get('port'), function() {
	console.log("Servidor activo");
});