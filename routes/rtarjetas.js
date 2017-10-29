module.exports = function(app, swig, gestorBD){

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// CREAR TARJETAS ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.post("/tarjetas/crear/:iban", function(req, res) {
        var iban = req.params.iban;

        var numero = req.body.password;
        var perdida = false;
        var activa = false;

        var criterioUsuario = { "nombreUsuario" : req.session.usuario };
        var criterioTarjeta = { "numero" : numero };	
        var criterioCuenta = { "iban" : iban  };	

        //la cuenta con el iban ya existe?
        gestorBD.obtenerCuentas(criterioCuenta ,function(cuentas){
            if ( cuentas != null ){
                gestorBD.obtenerTarjetas(criterioTarjeta,function(tarjetas){
                    if ( tarjetas == null ){
                        var tarjeta = {
                            numero : numero,
                            perdida : perdida,
                            activa : activa
                        }
                        gestorBD.insertarTarjeta(tarjeta, function(id) {
                            if (id == null){
                                res.redirect("/crearTarjeta?mensaje=Error al crear la tarjeta");
                            } else {
                                //crear asociacion de cuenta con usuario que la crea
                                gestorBD.cuentaPoseeTarjeta(criterioCuenta, numero ,function(usuarios){
                                        if ( usuarios == null ){
                                            res.send(respuesta);
                                        } else {
                                            gestorBD.usuarioPoseeTarjeta(criterioUsuario, numero ,function(usuarios){
                                                if ( usuarios == null ){
                                                    res.send(respuesta);
                                                } else {
                                                    res.redirect("/tarjetas?mensaje=Nueva tarjeta creada");
                                                }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.redirect("/crearTarjeta?mensaje=La tarjeta ya existe");
                    }
                });
            }else{
                res.redirect("/crearTarjeta?mensaje=La cuenta asociada a la tarjeta no existe");
            }  
        });     
    });


    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// TARJETAS USUARIO ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/tarjetas', function (req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterio = { "nombreUsuario" : nombreUsuario };

        gestorBD.usuarioTarjetas(criterio,function(tarjetas){
			if ( tarjetas == null ){
				res.send(respuesta);
			} else {
				var respuesta = swig.renderFile('views/tarjetas.html', 
				{
					tarjetas : tarjetas
				});
				res.send(respuesta);
			}
		});
    });

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// EDICION ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.put("/tarjeta/:numero", function(req, res) {
        var usuario = req.session.usuario;
        var numeroTarjeta = req.params.numero;

        var criterioUsuario = { "nombreUsuario" : usuario };
        var criterioTarjeta = { "numero" : numeroTarjeta  };	
        
        gestorBD.usuarioTarjetas(criterioUsuario, numeroTarjeta,function(tarjetas){
            if ( tarjetas != null ){
                var tarjeta = {
                    numero : numero,
                    perdida : perdida,
                    activa : activa
                }
                gestorBD.modificarTarjeta(criterioTarjeta, tarjeta, function(id) {
                    if (id == null){
                        res.redirect("/tarjetas?mensaje=Error al editar la tarjeta");
                        
                    } else {
                        res.redirect("/tarjetas?mensaje=Tarjeta editada correctamente");
                    }
                });
            } else {
                res.redirect("/tarjetas?mensaje=Tarjeta para ese usuario no existe");
            }
        });
    });
}