module.exports = function(app, swig, gestorBD, dateTime, ibanGenerator){
    
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// CREAR CUENTA /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get("/home", function(req, res){
        var respuesta = swig.renderFile('views/home.html', 
        {
            usuario:true
        });
        res.send(respuesta);
    })

    app.post("/cuenta/crear", function(req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterioUsuario = { "nombreUsuario" : nombreUsuario  };	

        //la cuenta con el iban ya existe?
        var ibanCuenta = null;
        do{
            try{
                ibanCuenta = ibanGenerator.doIban(ibanGenerator.randomNumber());
            }
            catch(Error){
            }
        }
        while(ibanCuenta == null)

        var criterioCuenta = { "iban" : ibanCuenta  };	

        gestorBD.obtenerCuentas(criterioCuenta ,function(cuentas){
            if ( cuentas[0] == null ){

                var cuenta = {
                    iban : ibanCuenta,
                    principal : false,
                    saldo : req.body.saldo
                }
                //crear cuenta
                gestorBD.insertarCuenta(cuenta, function(cuentas) {
                    if (cuentas == null){
                        res.redirect("/cuenta/crear?mensaje=Error al crear la cuenta");
                    } else {
                        //crear asociacion de cuenta con usuario que la crea
                        gestorBD.usuarioPoseeCuenta(criterioUsuario, ibanCuenta ,function(usuarios){
                            if ( usuarios == null ){
                                res.send(respuesta);
                            } else {
                                res.redirect("/cuentas" +
                                "?mensaje=Cuenta creada correctamente"+
                                "&tipoMensaje=alert-info ");
                            }
                        });
                    }
                });
            } else {
                res.redirect("/home" +
                "?mensaje=La cuenta con ese iban ya existe"+
                "&tipoMensaje=alert-danger ");
            }
        });
    });

    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// CUENTAS USUARIO /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    app.get('/cuentas', function (req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterio = { "nombreUsuario" : nombreUsuario} ;

        var busqueda = null;

        if( req.query.busqueda != null ){
        	busqueda = req.query.busqueda;
        }

        gestorBD.usuarioCuentas(criterio, busqueda, function(cuentas){
			if ( cuentas[0] == null ){
				var respuesta = swig.renderFile('views/cuentas.html', 
				{
					cuentas : [],
					usuario:true
				});
                res.send(respuesta);
			} else {                
				var respuesta = swig.renderFile('views/cuentas.html', 
				{
					cuentas : cuentas,
					usuario:true
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

        var movimientoBusqueda = null;
        var fechaMovimiento = null;
        
        if( req.query.movimientoBusqueda != null ){
            movimientoBusqueda = req.query.movimientoBusqueda;
        }
        if( req.query.fechaMovimiento != null ){
            fechaMovimiento = req.query.fechaMovimiento;
        }	
        
		gestorBD.usuarioCuentasIban(criterioUsuario, iban, movimientoBusqueda, fechaMovimiento, function(cuentas){
			if (cuentas[0] == null) {
				res.send("La cuenta no pertenece al usuario");
			} else {
				var respuesta = swig.renderFile('views/cuentaDetalle.html', 
				{
                    cuenta : cuentas[0],
                    usuario:true
                });
				res.send(respuesta);
			}
		});
    })

    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////// COMPARTIR CUENTA /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.post('/cuenta/compartir/:iban', function (req, res) {

        var criterioUsuarioCompartir = { "nombreUsuario" : req.body.usuarioCompartir };
        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var iban = req.params.iban;
	
		gestorBD.obtenerUsuarios(criterioUsuarioCompartir, function(usuarios){
			if (usuarios[0] == null) {
                res.redirect("/cuenta/" + iban +
                "?mensaje=El usuario no existe"+
                "&tipoMensaje=alert-danger");
			} else {
                gestorBD.usuarioCuentasIban(criterioUsuario, iban, null, null, function(cuentas){
                    if (cuentas == null) {
                        res.redirect("/cuenta/" + iban +
                        "?mensaje=El usuario no es dueño de la cuenta"+
                        "&tipoMensaje=alert-danger");
                    }
                    else{
                         gestorBD.usuarioCuentasIban(criterioUsuarioCompartir, iban, null, null, function(cuentas){
                            if (cuentas != null) {
                                res.redirect("/cuenta/" + iban +
                                "?mensaje=El usuario ya tiene compartida esta cuenta"+
                                "&tipoMensaje=alert-info");
                            } else {
                                gestorBD.usuarioPoseeCuenta(criterioUsuarioCompartir, iban ,function(usuarios){
                                    if ( usuarios == null ){
                                        res.redirect("/cuenta/" + iban +
                                        "?mensaje=Error al compartir la cuenta"+
                                        "&tipoMensaje=alert-danger");
                                    } else {
                                        res.redirect("/cuentas" +
                                        "?mensaje=Cuenta compartida correctamente"+
                                        "&tipoMensaje=alert-info");
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

    app.post('/cuenta/principal/:iban', function (req, res) {
        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var iban = req.params.iban;
    
        gestorBD.usuarioCuentasIban(criterioUsuario, iban, null, null, function(cuentas){
			if (cuentas == null) {
				res.redirect("/cuenta/" + iban + "?mensaje=La cuenta no pertenede al usuario&tipoMensaje=alert-danger");
			} else {
                gestorBD.usuarioCambiarPrincipal(criterioUsuario, iban, function(cuentas){
                    if (cuentas != true) {
                        res.redirect("/cuenta/" + iban + "?mensaje=Ha ocurrido un error procesando su operación&tipoMensaje=alert-danger");
                    } else {
                        res.redirect("/cuenta/" + iban + "?mensaje=Cuenta editada correctamente&tipoMensaje=alert-info");
                    }
                });
            }
		});
    })


    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// TRANSFERENCIA //////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.post('/cuenta/transferencia/:iban', function (req, res) {
        var iban = req.params.iban;

        var dt = dateTime.create();
        var fecha = dt.format('d/m/Y H:M:S');
        var concepto = req.body.concepto;
        var cantidad = req.body.cantidad;

        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var criterioCuenta = { "iban" : req.params.iban };

		gestorBD.usuarioCuentasIban(criterioUsuario, iban, null, null, function(cuentas){
			if (cuentas[0] == null) {
				res.send("Error al listar las cuentas del usuario");
			} else {
                var saldo = parseInt(cuentas[0].saldo);
                var cantidadInt = parseInt(cantidad);

                if(saldo >= cantidadInt){
                    var movimiento = {
                        fecha : fecha,
                        concepto : concepto,
                        cantidad : cantidadInt*(-1)
                    }

                    saldo = saldo - cantidadInt;

                    gestorBD.realizarTransferencia(criterioCuenta, movimiento, function(cuentas){
                        if (cuentas == null) {
                            res.send("Error al realizar la transferencia");
                        } else {
                            gestorBD.modificarSaldo(criterioCuenta, saldo, function(cuentas){
                                if (cuentas == null) {
                                    res.send("Error al modificar el saldo");
                                } else {
                                    gestorBD.usuarioCuentasIban(criterioUsuario, iban , null, null, function(cuentas){
                                        if (cuentas[0] == null) {
                                            res.send("La cuenta no pertenece al usuario");
                                        } else {
                                            var respuesta = swig.renderFile('views/cuentaDetalle.html', 
                                            {
                                                cuenta : cuentas[0],
                                                usuario:true
                                            });
                                            res.send(respuesta);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }else{
                    res.send("Saldo insuficiente");
                }
			}
		});
    })
}