module.exports = function(app, swig, gestorBD, dateTime){
    
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// CREAR CUENTA /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/cuenta/crear', function (req, res) {
		var respuesta = swig.renderFile('view/agregarCuenta.html', {});
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

    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// CUENTAS USUARIO /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/cuentas', function (req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterio = { "nombreUsuario" : nombreUsuario };

        gestorBD.usuarioCuentas(criterio,function(cuentas){
			if ( cuentas == null ){
				res.send(respuesta);
			} else {
				var respuesta = swig.renderFile('view/cuentas.html', 
				{
					cuentas : cuentas
				});
				res.send(respuesta);
			}
		});
    });
    
    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// DETALLE CUENTAS /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    
    app.get('/cuenta/:iban', function (req, res) {
        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var iban = req.params.iban;
	
		gestorBD.usuarioCuentas(criterioUsuario, iban ,function(cuentas){
			if (cuentas == null) {
				res.send("La cuenta no pertenece al usuario");
			} else {
				var respuesta = swig.renderFile('view/cuentaDetalle.html', 
				{
                    //las cuentas tienen dentro un array de movimientos
					cuentas : cuentas
				});
				res.send(respuesta);
			}
		});
    })

    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////// COMPARTIR CUENTA /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/cuenta/compartir/:iban', function (req, res) {

        var criterioUsuarioCompartir = { "nombreUsuario" : req.body.usuarioCompartir };
        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var iban = req.params.iban;
	
		gestorBD.obtenerUsuarios(criterioUsuarioCompartir, function(usuarios){
			if (usuarios == null) {
				res.send("El usuario no existe");
			} else {
                gestorBD.usuarioCuentas(criterioUsuario, iban ,function(cuentas){
                    if (cuentas == null) {
                        res.send("El usuario no es dueño de la cuenta " + iban);
                    }
                    else{
                         gestorBD.usuarioCuentas(criterioUsuarioCompartir, iban ,function(cuentas){
                            if (cuentas != null) {
                                res.send("El usuario ya tiene compartida esta cuenta");
                            } else {
                                gestorBD.usuarioPoseeCuenta(criterioUsuarioCompartir, iban ,function(usuarios){
                                    if ( usuarios == null ){
                                        res.send(respuesta);
                                    } else {
                                        res.redirect("/cuentas?mensaje=Cuenta compartida correctamente");
                                    }
                                });
                            }
                        });
                    }
                });                
			}
		});
    })
    
    
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////// CUENTA PRINCIPAL /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/cuenta/principal/:iban', function (req, res) {
        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var iban = req.params.iban;
    
        gestorBD.usuarioCuentas(criterioUsuario, iban ,function(cuentas){
			if (cuentas == null) {
				res.send("La cuenta no pertenece al usuario");
			} else {
                gestorBD.usuarioQuitarPrincipal(criterioUsuario ,function(cuentas){
                    if (cuentas == null) {
                        res.send("Ha ocurrido un error procesando su operacion");
                    } else {
                        gestorBD.usuarioPonerPrincipal(criterioUsuario, iban ,function(cuentas){
                            if (cuentas == null) {
                                res.send("Ha ocurrido un error procesando su operacion");
                            } else {
                               
                            }
                        });
                    }
                });
            }
		});
    })


    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// TRANSFERENCIA //////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.put('/cuenta/transferencia/:iban', function (req, res) {
        var iban = req.params.iban;

        var dt = datetime.create();
        var fecha = dt.format('d/m/Y H:M:S');
        var concepto = req.body.concepto;
        var cantidad = req.body.cantidad;

        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var criterioCuenta = { "iban" : req.params.iban };

		gestorBD.usuarioCuentas(criterioUsuario, iban ,function(cuentas){
			if (cuentas == null) {
				res.send("Error al listar las cuentas del usuario");
			} else {
                if(cuentas[0].saldo >= cantidad){
                    var transferencia = {
                        fecha : fecha,
                        concepto : concepto,
                        cantidad : cantidad
                    }

                    gestorBD.realizarTransferencia(criterioCuenta, transferencia ,function(cuentas){
                        if (cuentas == null) {
                            res.send("Error al realizar la transferencia");
                        } else {
                            var respuesta = swig.renderFile('view/cuentaDetalle.html', 
                            {
                                cuentas : cuentas
                            });
                            res.send(respuesta);
                        }
                    });

                }else{
                    res.send("Saldo insuficiente");
                }
			}
		});
    })
}