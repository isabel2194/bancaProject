module.exports = function(app, swig, gestorBD){
    
    app.get('/cuenta/crear', function (req, res) {
		var respuesta = swig.renderFile('views/agregarCuenta.html', {});
        res.send(respuesta);
    });
    
    app.get('/cuentas', function (req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterio = { "nombreUsuario" : nombreUsuario };

        gestorBD.usuarioCuentas(criterio,function(cuentas){
			if ( cuentas == null ){
				res.send(respuesta);
			} else {
				var respuesta = swig.renderFile('views/cuentas.html', 
				{
					cuentas : cuentas
				});
				res.send(respuesta);
			}
		});

		var respuesta = swig.renderFile('views/cuentas.html', {});
        res.send(respuesta);
	});
    
    app.post("/cuenta/crear", function(req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var ibanCUenta = req.body.iban

        var criterioCuenta = { "iban" : req.body.iban  };	
        var criterioUsuario = { "nombreUsuario" : nombreUsuario  };	

        //la cuenta con el iban ya existe?
        gestorBD.obtenerCuentas(criterioCuenta ,function(cuentas){
            if ( cuentas == null ){
                var cuenta = {
                    iban : ibanCuenta,
                    //por defecto está a falso??, solo se pone con la estrella desde el menú??
                    principal : false,
                    saldo : req.body.saldo
                }
                //crear cuenta
                gestorBD.insertarCuenta(cuenta, function(cuentas) {
                    if (cuentas == null){
                        res.redirect("/cuenta/crear?mensaje=Error al crear la cuenta");
                    } else {
                        //crear asociacion de cuenta con usuario que la crea
                        gestorBD.usuarioPoseeCuenta(criterioUsuario, ibanCUenta ,function(usuarios){
                            if ( usuarios == null ){
                                res.send(respuesta);
                            } else {
                                res.redirect("/cuentas?mensaje=Nueva cuenta creada");
                            }
                        });
                    }
                });
            } else {
                res.redirect("/cuenta/crear?mensaje=La cuenta con ese IBAN ya existe");
            }
        });
    });

    app.get('/cuenta', function (req, res) {
		var criterioUsuario = { "email" : req.session.nombreUsuario };
	
		gestorBD.usuarioCuentas(criterioUsuario ,function(cuentas){
			if (cuentas == null) {
				res.send("Error al listar las cuentas del usuario");
			} else {
				var respuesta = swig.renderFile('views/cuentas.html', 
				{
					cuentas : cuentas
				});
				res.send(respuesta);
			}
		});
	})
}