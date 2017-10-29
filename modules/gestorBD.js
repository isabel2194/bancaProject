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
    ,usuarioCuentas: function(criterioUsuario, busqueda, funcionCallback) {
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
                    
                        if (ArrayIds == null){ 
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
                                    if(busqueda != null){
                                        var nuevoArray = [];
                                        cuentas.forEach(function(element) {
                                            if(element.iban.indexOf(busqueda) > -1){
                                                nuevoArray.push(element);
                                            }
                                        }, this);
                                        funcionCallback(nuevoArray);
                                    }else{
                                        funcionCallback(cuentas);
                                    }
                                }
                                db.close();
                        });
                    }
                });
            }
        });
    }
    ,usuarioCuentasIban: function(criterioUsuario, iban, movimientoBusqueda, fechaMovimiento, funcionCallback) {
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
                        
                        if(ArrayIds.find(o => o === iban)){
                            var collection2 = db.collection('cuentas');
                            collection2.find({ "iban" : iban })
                                .toArray(function(err, cuentas) {                                    
                                if (err) {
                                    funcionCallback(null);
                                } else {
                                    if(movimientoBusqueda != null){
                                        var nuevoArray = [];
                                        cuentas[0].movimientos.forEach(function(element) {
                                            if(element.concepto.indexOf(movimientoBusqueda) > -1){
                                                nuevoArray.push(element);
                                            }
                                        }, this);
                                        cuentas[0].movimientos = nuevoArray;
                                    }
                                    if(fechaMovimiento != null){
                                        var nuevoArray = [];
                                        cuentas[0].movimientos.forEach(function(element) {
                                            if(element.fecha.indexOf(fechaMovimiento) > -1){
                                                nuevoArray.push(element);
                                            }
                                        }, this);
                                        cuentas[0].movimientos = nuevoArray;
                                    }
                                    funcionCallback(cuentas);
                                }
                                db.close();
                            });
                        }else{
                            funcionCallback(null);
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
    usuarioCambiarPrincipal: function(criterioUsuario, iban, funcionCallback) {
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
                                var principalAntigua = cuentas.find(o => o.principal == true);
                                var principalNueva = cuentas.find(o => o.iban == iban);

                                if(principalAntigua != undefined){
                                    //ya tenia una principal, la quito
                                    principalAntigua.principal = false;
                                    collection.update({iban : principalAntigua.iban}, {$set: principalAntigua}, function(err, result) {
                                        if (err) {
                                            funcionCallback(null);
                                        } else {
                                            //poner la mia como principal
                                            principalNueva.principal = true;
                                            collection.update({iban : principalNueva.iban}, {$set: principalNueva}, function(err, result) {
                                                if (err) {
                                                    funcionCallback(null);
                                                } else {
                                                    funcionCallback(true);
                                                }
                                            });
                                        }
                                    });
                                }else{
                                     //poner la mia como principal
                                     principalNueva.principal = true;
                                     collection.update({iban : principalNueva.iban}, {$set: principalNueva}, function(err, result) {
                                         if (err) {
                                             funcionCallback(null);
                                         } else {
                                             //poner la mia como principal
                                            funcionCallback(true);
                                         }
                                     });
                                }
                            }
                        });
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
    insertarTarjeta : function(tarjeta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('tarjetas');
                collection.insert(tarjeta, function(err, result) {
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
    usuarioTarjetasNumero: function(criterioUsuario, numero, funcionCallback) {
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
                        var tarjeta = ArrayIds.find(o => o == numero);
                        if(tarjeta != undefined){
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
    eliminarTarjeta : function(criterio, funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('tarjetas');
                collection.remove(criterio, function(err, tarjetas) {
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
    eliminarTarjetaUsuario: function(criterioUsuario, numeroTarjeta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('usuarios');
                collection.find(criterioUsuario).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var usuario = usuarios[0];
                    
                        if (usuario.tarjetas == null){ // Puede no tener compras
                            funcionCallback( {} );
                            db.close();
                            return;
                        }
                        var nuevoArray = [];
                        usuario.tarjetas.forEach(function(element) {
                            if(element != numeroTarjeta){
                                nuevoArray.push(element);
                            }
                        }, this);

                        usuario.tarjetas = nuevoArray;

                        var collection = db.collection('usuarios');
                        collection.update(criterioUsuario, {$set: usuario}, function(err, result) {
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
    },

    /////////////////////////////////////////////////////////////////////
    /////////////////////////// TRANSFERENCIA ///////////////////////////
    /////////////////////////////////////////////////////////////////////

    realizarTransferencia: function(criterioCuenta, movimiento, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('cuentas');
            
                collection.update(criterioCuenta, 
                        { $push: { "movimientos" : movimiento } }  , 
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
    modificarSaldo: function(criterioCuenta, saldo, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                
                var collection = db.collection('cuentas');
                collection.find(criterioCuenta).toArray(function(err, cuentas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var cuenta = cuentas[0];
                        cuenta.saldo = saldo;

                        collection.update(criterioCuenta, 
                            {$set: cuenta}  , 
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
        });
    },
};