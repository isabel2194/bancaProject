module.exports = function(app, swig, gestorBD){

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////// CREAR TARJETAS ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.post("/tarjetas/crear", function(req, res) {
        var iban = req.params.iban;

        var numero = req.body.numero;
        var iban = req.body.iban;

        console.log(iban);
        
        var perdida = false;
        var activa = false;

        var criterioUsuario = { "nombreUsuario" : req.session.nombreUsuario };
        var criterioTarjeta = { "numero" : numero };	
        var criterioCuenta = { "iban" : iban  };	

        //la cuenta con el iban ya existe?
        gestorBD.obtenerCuentas(criterioCuenta ,function(cuentas){
            if ( cuentas != null ){
                gestorBD.obtenerTarjetas(criterioTarjeta,function(tarjetas){
                    if ( tarjetas[0] == null ){
                        var tarjeta = {
                            numero : numero,
                            perdida : perdida,
                            activa : activa
                        }
                        gestorBD.insertarTarjeta(tarjeta, function(id) {
                            if (id == null){
                                res.send("error al crear la tarjeta");
                                //res.redirect("/crearTarjeta?mensaje=Error al crear la tarjeta");
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
                                                res.redirect("/tarjetas");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send("La tarjeta ya existe");
                        //res.redirect("/crearTarjeta?mensaje=La tarjeta ya existe");
                    }
                });
            }else{
                res.send("La cuenta asociada a la tarjeta no existe");
                //res.redirect("/crearTarjeta?mensaje=La cuenta asociada a la tarjeta no existe");
            }  
        });     
    });


    ///////////////////////////////////////////////////////////////////////////////
    ////////////////////////////// TARJETAS USUARIO ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get('/tarjetas', function (req, res) {
        var nombreUsuario = req.session.nombreUsuario;
        var criterio = { "nombreUsuario" : nombreUsuario };

        gestorBD.usuarioTarjetas(criterio, function(tarjetas){
			if ( tarjetas[0] == null){
				var respuesta = swig.renderFile('views/tarjetas.html', 
				{
                    tarjetas : [],
                    usuario:true
				});
                res.send(respuesta);

			} else {
                //res.send(tarjetas);
				var respuesta = swig.renderFile('views/tarjetas.html', 
				{
					tarjetas : tarjetas,
					usuario:true
				});
                res.send(respuesta);
			}
		});
    });

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// EDICION ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.post("/tarjeta/:numero", function(req, res) {

        
        var usuario = req.session.nombreUsuario;
        var numeroTarjeta = req.params.numero;
        var activa = req.body.estado;

        var criterioUsuario = { "nombreUsuario" : usuario };
        var criterioTarjeta = { "numero" : numeroTarjeta  };	
        
        gestorBD.usuarioTarjetasNumero(criterioUsuario, numeroTarjeta, function(tarjetas){
            if ( tarjetas != null ){
                var tarjeta = {
                    numero : numeroTarjeta,
                    perdida : perdida,
                    activa : activa
                }
                gestorBD.modificarTarjeta(criterioTarjeta, tarjeta, function(id) {
                    if (id == null){
                        res.send("Error al editar la tarjeta");
                        //res.redirect("/tarjetas?mensaje=Error al editar la tarjeta");
                        
                    } else {
                        res.send("Tarjeta editada correctamente");
                        //res.redirect("/tarjetas?mensaje=Tarjeta editada correctamente");
                    }
                });
            } else {
                res.send("Tarjeta para ese usuario no existe");
                //res.redirect("/tarjetas?mensaje=Tarjeta para ese usuario no existe");
            }
        });
    });

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// BORRADO ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////

    app.get("/tarjetaEliminar/:numero", function(req, res) {
        var usuario = req.session.nombreUsuario;
        var numeroTarjeta = req.params.numero;

        var criterioUsuario = { "nombreUsuario" : usuario };
        var criterioTarjeta = { "numero" : numeroTarjeta  };	

        gestorBD.usuarioTarjetasNumero(criterioUsuario, numeroTarjeta, function(tarjetas){
            if ( tarjetas != null ){
                gestorBD.eliminarTarjeta(criterioTarjeta, function(id) {
                    if (id == null){
                        res.redirect("/tarjetas" +
                        "?mensaje=Error al eliminar la tarjeta"+
                        "&tipoMensaje=alert-danger ");
                        
                    } else {
                        gestorBD.eliminarTarjetaUsuario(criterioUsuario, numeroTarjeta, function(id) {
                            if (id == null){
                                res.redirect("/tarjetas" +
                                "?mensaje=Error al eliminar la tarjeta"+
                                "&tipoMensaje=alert-danger ");                                
                            } else {
                                res.redirect("/tarjetas" +
                                "?mensaje=Tarjeta eliminada"+
                                "&tipoMensaje=alert-info ");
                            }
                        });
                    }
                });
            } else {
                res.send("Tarjeta para ese usuario no existe");
                //res.redirect("/tarjetas?mensaje=Tarjeta para ese usuario no existe");
            }
        }); 
    });
}