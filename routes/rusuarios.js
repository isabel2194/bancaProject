module.exports = function(app, swig, gestorBD){
    ////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// REGISTRO ///////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    app.get("/registrarse", function(req, res) {
    	var respuesta = swig.renderFile('views/registro.html', {});
		res.send(respuesta);
	});

    app.post("/registrarse", function(req, res) {
        var password1 = req.body.password;
        var password2 = req.body.repeatPassword;

        if(password1 == password2){
            var password = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');   

            //var dni = req.body.dni;
            //var movil = req.body.movil;
            var nombre = req.body.nombre;
            var apellidos = req.body.apellidos;
            //var direccion = req.body.direccion;
            //var fechaNacimiento = req.body.fechaNacimiento;
            var email = req.body.email;
            var nombreUsuario = req.body.nombreUsuario;

            if(nombre == null || apellidos == null || email == null || nombreUsuario == null){
                res.redirect("/registrarse" +
                "?mensaje=Rellene todos los campos"+
                "&tipoMensaje=alert-danger ");
            }
            else{
                var criterio = { "nombreUsuario" : req.body.nombreUsuario  };	
                gestorBD.obtenerUsuarios(criterio,function(usuarios){
                    if ( usuarios[0] == null ){
                        var usuario = {
                            DNI : req.body.dni,
                            movil : req.body.movil,
                            nombre : req.body.nombre,
                            apellidos : req.body.apellidos,
                            direccion : req.body.direccion,
                            fechaNacimiento : req.body.fechaNacimiento,
                            email : req.body.email,
                            password : password,
                            nombreUsuario : req.body.nombreUsuario,
                            cuentas : [],
                            tarjetas : []
                        }
    
                        gestorBD.insertarUsuario(usuario, function(id) {
                            if (id == null){
                                res.redirect("/registrarse" +
                                "?mensaje=Error al registrar el usuario"+
                                "&tipoMensaje=alert-danger ");
                                
                            } else {
                                res.redirect("/identificarse?mensaje=Nuevo usuario registrado"+
                                "&tipoMensaje=alert-success ");
                            }
                        });
                    } else {
                        res.redirect("/registrarse" +
                        "?mensaje=Usuario con ese identificador ya existe"+
                        "&tipoMensaje=alert-danger ");
                    }
                });
            }            
        }else{
            res.redirect("/registrarse" +
            "?mensaje=Las contraseñas no coinciden"+
            "&tipoMensaje=alert-danger ");
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// IDENTIFICACION ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////

    //igual esto no hace falta porque es un desplegable
    app.get("/identificarse", function(req, res) {
		var respuesta = swig.renderFile('views/index.html', {});
		res.send(respuesta);
	});

	app.post("/identificarse", function(req, res) {
		var password = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');   

		var criterio = {
			nombreUsuario : req.body.nombreUsuario
		}

		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios[0] == null) {
                req.session.nombreUsuario = null;
				res.redirect("/identificarse" +
						"?mensaje=Nombre de usuario o password incorrecto"+
						"&tipoMensaje=alert-danger ");
			} else {
                if(usuarios[0].password == password){
                    req.session.nombreUsuario = criterio.nombreUsuario;
                    res.redirect("/home");
                }
                else{
                    res.redirect("/identificarse" +
                    "?mensaje=Nombre de usuario o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
                }
			}
		});
    });

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// EDICION ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    app.get("/perfil", function(req, res) {
    	var respuesta = swig.renderFile('views/perfil.html', {
    		nombreUsuario: req.session.nombreUsuario,
    		usuario: true
    	});
		res.send(respuesta);
	});

    app.post("/editarPassUsuario/:nombreUsuario", function(req, res) {
        var password1 = req.body.password;
        var password2 = req.body.repeatPassword;

        if(password1 == password2){
            var password = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');   
        
        
            var criterio = { "nombreUsuario" : req.params.nombreUsuario  };	
            
            gestorBD.obtenerUsuarios(criterio,function(usuarios){
                if ( usuarios[0] != null ){
                    var usuario = {
                        password : password
                    }
                    gestorBD.modificarUsuario(criterio, usuario, function(id) {
                        if (id == null){
                            res.redirect("/registrarse?mensaje=Error al editar el usuario");
                        } else {
                            res.redirect("/identificarse?mensaje=Usuario editado correctamente");
                        }
                    });
                } else {
                    res.redirect("/registrarse?mensaje=El usuario con ese identificador no existe");
                }
            });
        }else{
            res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// CERRAR SESION ////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////

    app.get("/cerrarSesion", function(req, res) {
        var respuesta = swig.renderFile('views/index.html', {
            usuario : false
        });

        req.session.nombreUsuario = null;
        req.session.destroy();

		res.send(respuesta);
    });
    
    app.get("/formularioInversores", function(req, res) {
        var respuesta = swig.renderFile('views/formularioInversores.html', {
            usuario : true
        });
		res.send(respuesta);
    });
}