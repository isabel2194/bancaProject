module.exports = {
	mongo : null,
	app : null,
	init : function(app, mongo) {
		this.mongo = mongo;
		this.app = app;
    },

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// USUARIOS //////////////////////////////
    //////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////
    ////////////////////////////// CUENTAS //////////////////////////////
    /////////////////////////////////////////////////////////////////////

    ,
    obtenerCuentas : function(criterio ,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('cuentas');
                collection.find(criterio).toArray(function(err, cuentas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(cuentas);
                    }
                    db.close();
                });
            }
        });
    },
    insertarCuenta : function(cuenta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
                collection.insert(cuenta, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }

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
    ,usuarioCuentas: function(criterioUsuario, iban, funcionCallback) {
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
                        if($.inArray(iban, ArrayIds)){
                            var collection2 = db.collection('cuentas');
                            collection2.find({ "iban" : iban })
                                .toArray(function(err, cuentas) {
                                    
                                if (err) {
                                    funcionCallback(null);
                                } else {
                                    //movimientos para esa cuenta
                                    
                                    funcionCallback(cuentas);
                                }
                                db.close();
                            });
                        }
                    }
                });
            }
        });
    }
    ,usuarioPoseeCuenta: function(criterioUsuario, ibanCuenta, funcionCallback) {
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
    },
    usuarioQuitarPrincipal: function(criterioUsuario, funcionCallback) {
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
                                cuentas.find({ "principal" : true })
                                .toArray(function(err, cuentas) {
                                    if (err) {
                                        funcionCallback(true);
                                    } else {
                                        var cuenta = cuentas[0];
                                        cuenta.principal = false;
                                        collection.update({iban : cuenta.iban}, {$set: cuenta}, function(err, result) {
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
                        });
                    }
                });
            }
        });
    },
    usuarioPonerPrincipal : function(criterioUsuario, iban, funcionCallback) {
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
    
                        if($.inArray(iban, ArrayIds)){
                            var collection2 = db.collection('cuentas');
                            collection2.find({ "iban" : iban })
                                .toArray(function(err, cuentas) {
                                if (err) {
                                    funcionCallback(null);
                                } else {
                                    var cuenta = cuentas[0];
                                    cuenta.principal = true;
                                    collection.update({iban : iban}, {$set: cuenta}, function(err, result) {
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
                    }
                });
            }
        });
    },

    /////////////////////////////////////////////////////////////////////
    ////////////////////////////// TARJETAS /////////////////////////////
    /////////////////////////////////////////////////////////////////////

    obtenerTarjetas : function(criterio, funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('tarjetas');
                collection.find(criterio).toArray(function(err, tarjetas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(tarjetas);
                    }
                    db.close();
                });
            }
        });
    },
    cuentaPoseeTarjeta: function(criterioCuenta, numero, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
            
                collection.update(criterioCuenta, 
                        { $push: { "tarjetas" : numero } }  , 
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
    },
    usuarioPoseeTarjeta: function(criterioUsuario, numero, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
            
                collection.update(criterioUsuario, 
                        { $push: { "tarjetas" : numero } }  , 
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
    },
    usuarioTarjetas: function(criterioUsuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('usuarios');
                collection.find(criterioUsuario).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var ArrayIds = usuarios[0].tarjetas;
                    
                        if (ArrayIds == null){ // Puede no tener compras
                            funcionCallback( {} );
                            db.close();
                            return;
                        }
    
                        var collection = db.collection('tarjetas');
                        collection.find({ "numero" : { $in: ArrayIds } })
                            .toArray(function(err, tarjetas) {
                                
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(tarjetas);
                            }
                            db.close();
                        });
                    }
                });
            }
        });
    },
    usuarioTarjetas: function(criterioUsuario, numero, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('usuarios');
                collection.find(criterioUsuario).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var ArrayIds = usuarios[0].tarjetas;
                    
                        if (ArrayIds == null){ // Puede no tener compras
                            funcionCallback( {} );
                            db.close();
                            return;
                        }
                        if($.inArray(numero, ArrayIds)){
                            funcionCallback(true);
                        }
                        else{
                            funcionCallback(null);
                        }
                    }
                });
            }
        });
    },
    modificarTarjeta : function(criterio, tarjeta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('tarjetas');
                collection.update(criterio, {$set: tarjeta}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    /////////////////////////////////////////////////////////////////////
    /////////////////////////// TRANSFERENCIA ///////////////////////////
    /////////////////////////////////////////////////////////////////////

    realizarTransferencia: function(criterioCuenta, transferencia, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
            
                collection.update(criterioCuenta, 
                        { $push: { "transferencias" : transferencia } }  , 
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
    },
};