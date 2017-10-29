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

            var dni = req.body.dni;
            var movil = req.body.movil;
            var nombre = req.body.nombre;
            var apellidos = req.body.apellidos;
            var direccion = req.body.direccion;
            var fechaNacimiento = req.body.fechaNacimiento;
            var email = req.body.email;
            var nombreUsuario = req.body.nombreUsuario;

            if(dni == null || movil == null || nombre == null || apellidos == null || direccion == null || 
                fechaNacimiento == null || email == null || nombreUsuario == null){
                    res.send("Rellene todos los campos");
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
                                res.send("error al registrar usuario")
                                //res.redirect("/registrarse?mensaje=Error al registrar usuario");
                                
                            } else {
                                res.send("Nuevo usuario registrado");
                                //res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                            }
                        });
                    } else {
                        res.send("Un usuario con ese identificador ya existe");
                    }
                });
            }            
        }else{
            res.send("Las contraseñas no coinciden");
            //res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// IDENTIFICACION ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////

    //igual esto no hace falta porque es un desplegable
    app.get("/identificarse", function(req, res) {
		var respuesta = swig.renderFile('views/identificacion.html', {});
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
                res.send("Nombre o contraseña incorrectos")
				res.redirect("/identificarse" +
						"?mensaje=Nombre de usuario o password incorrecto"+
						"&tipoMensaje=alert-danger ");
			} else {
                if(usuarios[0].password == password){
                    var respuesta = swig.renderFile('views/home.html', 
                    {
                        usuario : true
                    });
                    req.session.nombreUsuario = criterio.nombreUsuario;
                    res.send(respuesta);
                    console.log("usuario identificado");
                }
                else{
                    res.send("Nombre o contraseña incorrectos")
                }
			}
		});
    });

    ///////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// EDICION ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    
    app.put("/editarUsuario/:nombreUsuario", function(req, res) {
        var criterio = { "nombreUsuario" : req.params.nombreUsuario  };	
        
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if ( usuarios[0] != null){
                var usuario = {
                    DNI : req.body.dni,
                    movil : req.body.movil,
                    nombre : req.body.nombre,
                    apellidos : req.body.apellidos,
                    direccion : req.body.direccion,
                    fechaNacimiento : req.body.fechaNacimiento,
                    email : req.body.email
                }
                gestorBD.modificarUsuario(criterio, usuario, function(id) {
                    if (id == null){
                        res.send("Error al editar el usuario");
                        //res.redirect("/registrarse?mensaje=Error al editar el usuario");
                    } else {
                        res.send("Usuario editado correctamente")
                        //res.redirect("/identificarse?mensaje=Usuario editado correctamente");
                    }
                });
            } else {
                res.send("El usuario con ese identificador no existe");
                //res.redirect("/registrarse?mensaje=El usuario con ese identificador no existe");
            }
        });
    });

    app.put("/editarPassUsuario/:nombreUsuario", function(req, res) {
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
                            res.send("error al editar las contraseñas");
                            //res.redirect("/registrarse?mensaje=Error al editar el usuario");
                        } else {
                            res.send("usuario editado correctamente");
                            //res.redirect("/identificarse?mensaje=Usuario editado correctamente");
                        }
                    });
                } else {
                    res.send("usuario con identificador no existe");
                    //res.redirect("/registrarse?mensaje=El usuario con ese identificador no existe");
                }
            });
        }else{
            res.send("las contraseñas no coinciden");
            //res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
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
}