// Módulos
var express = require('express');

var app = express();

var expressSession = require('express-session');
app.use(expressSession({
    secret: 's3s10ns3cr3t4',
    resave: true,
    saveUninitialized: true
}));

var crypto = require('crypto');

var mongo = require('mongodb');
var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

var swig  = require('swig');

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

//routerUsuarioSession
var routerUsuarioSession = express.Router(); 
routerUsuarioSession.use(function(req, res, next) {
	 console.log("routerUsuarioSession");
	  if ( req.session.usuario ) {
	    // dejamos correr la petición
	     next();
	  } else {
	     console.log("va a : " + req.session.destino)
	     res.redirect("/identificarse");
	  }
});

//Aplicar routerUsuarioSession
//usuario

//app.use("/editarUsuario/:nombreUsuario", routerUsuarioSession);
//app.use("/editarPassUsuario/:nombreUsuario", routerUsuarioSession);
//app.use("/cerrarSesion", routerUsuarioSession);

//cuenta
//comprobar si es asi
//app.use("/cuenta*",routerUsuarioSession);
//app.use("/tarjeta*", routerUsuarioSession);

app.use(express.static('public'));


app.set('port', 8081);
app.set('db','mongodb://admin:b4nc4pr0j3ct!@ds237445.mlab.com:37445/bancaproject');
app.set('clave','abcdefg');
app.set('crypto',crypto);


var dateTime = require('node-datetime');

require("./routes/rcuentas.js")(app, swig, gestorBD, dateTime);
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rtarjetas.js")(app, swig, gestorBD);

app.get('/', function (req, res) {
	var respuesta = swig.renderFile('views/index.html', 
	{
		usuario : false
	});
	res.send(respuesta);
})

// lanzar el servidor
app.listen(app.get('port'), function() {
	console.log("Servidor activo");
});