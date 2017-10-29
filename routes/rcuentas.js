module.exports = function(app, swig, gestorBD, dateTime, ibanGenerator){
    
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// CREAR CUENTA /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/cuenta/crear', function (req, res) {
        res.send("crear cuenta")
		//var respuesta = swig.renderFile('view/agregarCuenta.html', {});
        //res.send(respuesta);
    });

    app.post("/cuenta/crear", function(req, res) {
        console.log("/cuenta/crear");
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
                                res.send("Nueva cuenta creada");
                                //res.redirect("/cuentas?mensaje=Nueva cuenta creada");
                            }
                        });
                    }
                });
            } else {
                res.send("La cuenta con ese iban ya existe, vuelve a probar mas tarde");
                //res.redirect("/cuenta/crear?mensaje=La cuenta con ese IBAN ya existe");
            }
        });
    });

    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// CUENTAS USUARIO /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/cuentas', function (req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterio = { "nombreUsuario" : nombreUsuario };

        gestorBD.usuarioCuentas(criterio, function(cuentas){
			if ( cuentas[0] == null ){
				res.send("Usuario sin cuentas");
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
	
		gestorBD.usuarioCuentasIban(criterioUsuario, iban ,function(cuentas){
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
            console.log("obtenerUsuarios");
			if (usuarios[0] == null) {
				res.send("El usuario no existe");
			} else {
                console.log("else");
                gestorBD.usuarioCuentasIban(criterioUsuario, iban ,function(cuentas){
                    console.log("usuarioCuentas");
                    if (cuentas == null) {
                        res.send("El usuario no es dueño de la cuenta " + iban);
                    }
                    else{
                        console.log("else");
                         gestorBD.usuarioCuentasIban(criterioUsuarioCompartir, iban ,function(cuentas){
                            console.log("usuarioCuentas");
                            if (cuentas != null) {
                                console.log(cuentas);
                                res.send("El usuario ya tiene compartida esta cuenta");
                            } else {
                                console.log("else");
                                gestorBD.usuarioPoseeCuenta(criterioUsuarioCompartir, iban ,function(usuarios){
                                    console.log("usuarioPoseeCuenta");
                                    if ( usuarios[0] == null ){
                                        res.send("Error al compartir la cuenta, vuelva a intentarlo más tarde");
                                    } else {
                                        res.send(usuarios);
                                        //res.redirect("/cuentas?mensaje=Cuenta compartida correctamente");
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
        console.log("/cuenta/principal/ + req.params.iban");
        var criterioUsuario = { "nombreUsuario" : req.body.nombreUsuario };
        var iban = req.params.iban;
    
        gestorBD.usuarioCuentasIban(criterioUsuario, iban ,function(cuentas){
			if (cuentas == null) {
				res.send("La cuenta no pertenece al usuario");
			} else {
                gestorBD.usuarioCambiarPrincipal(criterioUsuario, iban, function(cuentas){
                    if (cuentas != true) {
                        res.send("Ha ocurrido un error procesando su operacion");
                    } else {
                        gestorBD.usuarioCuentas(criterioUsuario, function(cuentas){
                            if ( cuentas[0] == null ){
                                res.send("Usuario sin cuentas");
                            } else {
                                var respuesta = swig.renderFile('views/cuentas.html', 
                                {
                                    cuentas : cuentas
                                });
                                res.send(respuesta);
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

        var dt = dateTime.create();
        var fecha = dt.format('d/m/Y H:M:S');
        var concepto = req.body.concepto;
        var cantidad = req.body.cantidad;

        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var criterioCuenta = { "iban" : req.params.iban };

		gestorBD.usuarioCuentasIban(criterioUsuario, iban, function(cuentas){
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
                                    var respuesta = swig.renderFile('view/cuentaDetalle.html', 
                                    {
                                        cuentas : cuentas
                                    });
                                    res.send(respuesta);
                                    //res.send("transferencia realizada con exito");
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