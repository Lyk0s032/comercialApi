const express = require('express');
const { client, call, register, calendary, user, cotizacion } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');
const dayjs = require('dayjs');
const { cumplido, aplazado } = require('./services/calendaryServices');
const { addNoteServices } = require('./services/notesServices');
const { createVisitaServices } = require('./services/visitasServices');
const { searchUserServices } = require('./services/userService');
const { Op } = require('sequelize');

// CONTROLADORES DEL CLIENTE - LLAMADAS

const getCalls = async (req, res) => {
    try{
        // Consultamos todo.
        const { userId} = req.params;
        // Validamos que entre correctamente
        if(!userId) return res.status(501).json({msg: 'Parametro invalido.'});

        // Buscamos usuario
        const searchUser = await searchUserServices(userId)
        .then((res) => res)
        .catch((err) => {
            console.log(err);
            return null;
        });
        console.log(searchUser)
        if(!searchUser) return res.status(404).json({msg: 'No hemos encontrado este usuario.'});
        
        // SI ES EL LIDER ME TRAE TODO.
        if(searchUser.rango == 'lider'){
            // Caso contrario, avanzamos...
            const searchCall = await call.findAll({
                where: {
                    state: {
                        [Op.or]: ['active', 'aplazado', 'perdido']
                    }
                }, 
                include:[{
                    model: client,
                    include: [{
                        model: register,
                        include:[{
                            model: user
                        }]
                    }]
                }, {
                    model: calendary
                }, {
                    model: user
                }],
            }).catch(err => {
                console.log(err);
                return null;
            });
            // Validamos
            if(!searchCall || !searchCall.length) return res.status(404).json({msg: 'No hay resultado.'});
            // Caso contrario, envio respuesta
            res.status(200).json(searchCall);

            // CASO CONTRARIO, SI ES ASESOR ENTONCES POR SUS RESULTADOS.
        }else if(searchUser.rango == 'asesor'){
             // Caso contrario, avanzamos...
             const searchCall = await call.findAll({
                where: {
                    userId: searchUser.id,
                    state: {
                        [Op.or]: ['active', 'aplazado', 'perdido']
                    }
                }, 
                include:[{
                    model: client,
                    include: [{
                        model: register,
                        include:[{
                            model: user
                        }]
                    }]
                }, {
                    model: calendary
                },{
                    model: user
                }],
                order: [['createdAt', 'DESC'], [{ model: client}, { model: register}, 'createdAt', 'ASC']],

            }).catch(err => {
                console.log(err);
                return null;
            });
            // Validamos
            if(!searchCall || !searchCall.length) return res.status(404).json({msg: 'No hay resultado.'});
            // Caso contrario, envio respuesta
            res.status(200).json(searchCall);
        }
        

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


const getCall = async (req, res) => {
    try{
        // Recibo parametros por params
        const { callId } = req.params;
        // Validamos
        if(!callId) return res.status(501).json({msg: 'Parametro invalido.'});
        // Consultamos todo.
        const searchCall = await call.findOne({
            where: {
                id: callId,
                state: 'active'
            },
            include:[{
                model: client,
                include: [{
                    model: register,
                    include:[{
                        model: user
                    }]
                }]
            }, { 
                model: calendary,
                where: {
                    state: 'active'
                }
            }],

            
            order: [['createdAt', 'DESC'], [{ model: client}, { model: register}, 'createdAt', 'ASC']],

        }).catch(err => {
            console.log(err);
            return null;
        });
        // Validamos
        if(!searchCall) return res.status(404).json({msg: 'No hay resultado.'});
        // Caso contrario, envio respuesta
        res.status(200).json(searchCall);

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// CREAR CALL - 
const createCall = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { title, caso, clientId, userId, time, hour, contactId} = req.body; 
        // Validamos que entren los datos necesarios
        if(!title || !caso || !clientId || !userId || !contactId) return  res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const createCliente = await call.create({
            title,
            case: caso, // Contacto 1, contacto 2, contacto 3.
            clientId,
            userId,
            contactId: contactId,
            state: 'active' 
        })
        .then(async (result) => {
            // CREAMOS EL BODY PARA AGREGAR EVENTO AL CALENDARIO
            let body = {
                userId,
                clientId,
                callId: result.id,
                type: 'contacto',
                caso: 'contacto 1',
                contacto: 'contacto 1',
                note: title,
                time,
                hour, 
                state: 'active'
            }
            const toCalendar = await axios.post('/api/calendario/new/', body)
            .then((result) => result.data)
            .then((data) => {
                console.log('cumple la funcion')
                return data
            })
            .catch(err => {
                console.log(err);
                console.log('No hemos logrado conectar la funcion')
                return null;
            })

            return result
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!createCliente) return res.status(502).json({msg: 'No hemos odido crear esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json(createCliente);

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// Agendar visita
const agendaVisita = async (req, res) => {
    try{
        const { callId, clientId, userId, calendaryId, title, time, hour} = req.body;
    
        if(!callId || !clientId || !userId || !calendaryId || !title || !time) return res.status(501).json({msg: 'Los parametros no son validos.'});

        // Caso contrario, avanzamos
        const callOk = await call.update({
            state: 'cumplida',
        }, {
            where: {
                id:callId
            }
        })
        .then(async (result) => {
            const cumplida = await cumplido(calendaryId, null)
            return result;
        }).then(async (data) => {

            //title, clientId, userId, time, hour
            const agendar = await createVisitaServices(title, clientId, userId, time, hour)
            return agendar;
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!callOk) return res.status(502).json({msg:'No hemos logrado actualizar esto.'});
        // Caso contrario, avanzamos...
        res.status(200).json({msg: 'Visita agendada con exito.'});
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// AGENDAR COTIZACIÓN
const agendaCotizacion = async (req, res) => {
    try{
        const { callId, clientId, userId, calendaryId,
            name, nit, nro, fecha, bruto, iva, descuento, neto, state
        } = req.body;
    
        if(!callId || !clientId || !userId || !calendaryId ) return res.status(501).json({msg: 'Los parametros no son validos.'});

        // Caso contrario, avanzamos
        const callOk = await call.update({
            state: 'cumplida',
        }, {
            where: {
                id:callId
            }
        })
        .then(async (result) => {
            const cumplida = await cumplido(calendaryId, null)
            return result;
        })
        .then(async (data) => {
            let body = {
                name,
                nit,
                nro,
                fecha,
                fechaAprobada: null,
                bruto,
                descuento,
                iva,
                neto,
                clientId,
                userId,
                state
            }
            const toCalendar = await axios.post('/api/cotizacion/addDesarrollo', body)
            .then((result) => result.data)
            .then((data) => {
                console.log('cumple la funcion')
                return data
            })
            .catch(err => {
                console.log(err);
                console.log('No hemos logrado conectar la funcion')
                return null;
            });

            return toCalendar
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!callOk) return res.status(502).json({msg:'No hemos logrado actualizar esto.'});

        const searchInfo = await cotizacion.findByPk(callOk.id,{
            include: [{
                model:client
            }, {model: calendary}, {model:user}]
        }).catch(err => {
            console.log(err);
            return null;
        })
        // Caso contrario, avanzamos...
        res.status(200).json(searchInfo);
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// No contesto
const DontCall = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const {callId, title, userId, clientId, caso,  time, hour } = req.body; 
        // Validamos que entren los datos necesarios

        const fecha = dayjs(time) // Esta fecha es la que tiene el calendario activo.
        // Agregamos 3 dias
        const newFecha = fecha.add(3, 'day');
        if(!callId || !time || !hour ) return res.status(501).json({msg: 'Parametros no validos.'});
        if(caso == "contacto 2" || caso == "contacto 3"){
            
            // caso contrario, creamos el cliente.
            const updateClient = await call.update({
                title,
                case: caso, // Contacto 1, contacto 2
                // , contacto 3.
            }, {
                where: {
                    id: callId
                }
            })
            .then(async (upd) => {
                const updateCalendary = await calendary.update({
                    state: 'aplazado',
                }, {
                    where: {
                        callId
                    }
                }).catch(err => {
                    console.log('err')
                    return null;
                })

                return 1
            })
            .then(async(res) => {
                // CREAMOS EL BODY PARA AGREGAR EVENTO AL CALENDARIO
                let body = {
                    userId,
                    clientId,
                    callId,
                    type: 'contacto',
                    caso: caso,
                    contacto: caso,
                    note: title,
                    time: newFecha,
                    hour
                }
                const toCalendar = await axios.post('/api/calendario/new/', body)
                .then((res) => res.data)
                .then((data) => {
                    console.log('cumple la funcion')
                    return data
                })
                .catch(err => {
                    console.log(err);
                    console.log('No hemos logrado conectar la funcion')
                    return null;
                })

                return res
            })
            .catch(err => {
                console.log(err);
                return null;
            });

            if(!updateClient) return res.status(502).json({msg: 'No hemos logrado crear esto.'});
            // Caso contrario, enviamos respuesta.
            return res.status(201).json({msg: 'Aplazado con exito.'});
        }else{
            const lostCall = await call.update({
                state: 'perdido'
            }, {
                where: {
                    id: callId
                }
            })
            .then( async (res) => {
                const cancelCalendary = await calendary.update({
                    state: 'cancelado'
                },{
                    where: {
                        callId,
                        state: 'active'
                    }
                }).catch(err => {
                    console.log(err);
                    return null
                });

                return res 
            })
            .catch(err => {
                console.log(err);
                return null;
            });

            if(!lostCall) return res.status(502).json({msg:'No logramos actualizar esto.'});
            
            // Caso contrario, avanzamos
            return res.status(200).json({msg: 'Enviado a perdidos.'});
        }

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// Aplazar
const aplazarCall = async(req, res) => {
    try{
        // Recibimos los datos por body
        const { title, note, tags, callId, userId, clientId, calendaryId, time, hour } = req.body;
        // Validamos
        if(!title || !clientId || !userId || !calendaryId || !time || !hour) res.status(501).json({msg: 'Parametros no validos.'});
        // Caso contrario, avanzamos
        // Actualizamos el estado.
        const updateCall = await call.update({
            state: 'aplazado',
            case: 'contacto 1'
        }, {
            where: {
                id: callId
            }
        })
        .then(async(result) => {
            const aplazar = await aplazado(calendaryId)
            return result
        })
        .then(async(data) => {
            let body = {
                userId,
                clientId,
                callId: callId,
                type: 'contacto',
                caso: 'contacto 1',
                contacto: 'contacto 1',
                note,
                tags,
                time,
                hour, 
                state: 'active'
            }
            const toCalendar = await axios.post('/api/calendario/new/', body)
            .then((result) => result.data)
            .then((data) => {
                console.log('cumple la funcion')
                return data
            })
            .catch(err => {
                console.log(err);
                console.log('No hemos logrado conectar la funcion')
                return null;
            })
            return data
        })
        .catch(err => {
            console.log(err);
            return null
        })

        if(!updateCall) return res.status(502).json({msg: 'No hemos logrado actualizar esto.'});
        // Caso contrario, avanzamos
        res.status(200).json({msg:'Actualizado con exito'});
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
    }
}
// No tuvo interes
const SinInteresLlamada = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const {callId, userId, clientId, contacto, nota, tags, calendaryId } = req.body; 
        // Validamos datos del servidor

        if(!callId || !clientId || !calendaryId) return res.status(501).json({msg: 'Parametros no son validos.'});

        // Caso contrario
        const CallLost = await call.update({
            state: 'perdido', 
        }, {
            where: {
                id: callId,
                clientId
            }
        })
        .then(async (result) => {
            // type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectId, calendaryId,
            const updateCalendario = await cumplido(calendaryId, 'perdido')
            .then(async () => {
                const newNote = await addNoteServices('contacto', contacto, null, tags, nota, 'perdido', 'automatico', userId, clientId, callId, null, null, calendaryId) 
                return newNote;
            }).catch(err => {
                console.log(err);
                return false
            })
            return result;

        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!CallLost) return res.status(502).json({msg:'No hemos logrado actualizar esto.'});

        // caso contrario
        res.status(200).json({msg: 'Actualizado con exito.'});
    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
module.exports = {
    getCalls,
    getCall,
    createCall,
    DontCall,
    SinInteresLlamada,
    aplazarCall,
    agendaVisita,
    agendaCotizacion
} 