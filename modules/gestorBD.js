module.exports = {
	mongo : null,
	app : null,
	init : function(app, mongo) {
		this.mongo = mongo;
		this.app = app;
    },

    ////////////////////////////// USUARIOS //////////////////////////////

    obtenerUsuarios : function(criterio,funcionCallback){
            this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
                if (err) {
                    funcionCallback(null);
                } else {
                    
                    var collection = db.collection('usuarios');
                    collection.find(criterio).toArray(function(err, usuarios) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(usuarios);
                        }
                        db.close();
                    });
                }
            });
        },
        insertarUsuario : function(usuario, funcionCallback) {
            this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
                if (err) {
                    funcionCallback(null);
                } else {
                    var collection = db.collection('usuarios');
                    collection.insert(usuario, function(err, result) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(result.ops[0]._id);
                        }
                        db.close();
                    });
                }
            });
        },
        modificarUsuario : function(criterio, usuario, funcionCallback) {
            this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
                if (err) {
                    funcionCallback(null);
                } else {
                    var collection = db.collection('usuarios');
                    collection.update(criterio, {$set: usuario}, function(err, result) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(result);
                        }
                        db.close();
                    });
                }
            });
        }

        ////////////////////////////// CUENTAS //////////////////////////////

        ,usuarioCuentas: function(criterioUsuario, funcionCallback) {
            this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
                if (err) {
                    funcionCallback(null);
                } else {
                    
                    var collection = db.collection('usuarios');
                    collection.find(criterioUsuario).toArray(function(err, usuarios) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            var ArrayIds = usuarios[0].cuentas;
                        
                            if (ArrayIds == null){ // Puede no tener compras
                                funcionCallback( {} );
                                db.close();
                                return;
                            }
        
                            var collection = db.collection('cuentas');
                            collection.find({ "iban" : { $in: ArrayIds } })
                                .toArray(function(err, cuentas) {
                                    
                                if (err) {
                                    funcionCallback(null);
                                } else {
                                    funcionCallback(cuentas);
                                }
                                db.close();
                            });
                        }
                    });
                }
            });
        }
        ,usuarioComprarCancion: function(criterioUsuario, ibanCuenta, funcionCallback) {
            this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
                if (err) {
                    funcionCallback(null);
                } else {
                    var collection = db.collection('usuarios');
                
                    collection.update(criterioUsuario, 
                            { $push: { "cuentas" : ibanCuenta } }  , 
                            function(err, result) {
                                
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(result);
                        }
                        db.close();
                    });
                }
            });
        }  
};