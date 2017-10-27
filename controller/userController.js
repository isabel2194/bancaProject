module.exports = function(app, swig, gestorBD){
    app.post("/registrar", function(req, res) {
        var password1 = req.body.password;
        var password2 = req.body.repeatPassword;

        if(password1 == password2){
            var password = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');   

            var criterio = { "nombreUsuario" : req.body.nombreUsuario  };	
            gestorBD.obtenerUsuarios(criterio,function(usuarios){
                if ( usuarios == null ){
                    var usuario = {
                        DNI : req.body.dni,
                        movil : req.body.movil,
                        nombre : req.body.nombre,
                        apellidos : req.body.apellidos,
                        direccion : req.body.direccion,
                        fechaNacimiento : req.body.fechaNacimiento,
                        email : req.body.email,
                        password : password1,
                        nombreUsuario : req.body.nombreUsuario
                    }

                    gestorBD.insertarUsuario(usuario, function(id) {
                        if (id == null){
                            res.redirect("/registrarse?mensaje=Error al registrar usuario");
                            
                        } else {
                            res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                        }
                    });
                } else {
                    res.redirect("/registrarse?mensaje=Un usuario con ese identificador ya existe");
                }
            });
        }else{
            res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
        }
    });

    app.put("/editarUsuario/:nombreUsuario", function(req, res) {
        var criterio = { "nombreUsuario" : req.params.nombreUsuario  };	
        
        gestorBD.obtenerUsuarios(criterio,function(usuarios){
            if ( usuarios != null ){
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
                        res.redirect("/registrarse?mensaje=Error al editar el usuario");
                        
                    } else {
                        res.redirect("/identificarse?mensaje=Usuario editado correctamente");
                    }
                });
            } else {
                res.redirect("/registrarse?mensaje=El usuario con ese identificador no existe");
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
                if ( usuarios != null ){
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
}