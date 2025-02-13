const express = require('express');
const { client, call, register, cotizacion, visita, calendary, user } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');
const dayjs = require('dayjs');
const { cancelar, aplazado, cumplido } = require('./services/calendaryServices');
const { addNoteServices } = require('./services/notesServices');
const { searchUserServices } = require('./services/userService');
const { Op } = require('sequelize');

// CONTROLADORES DEL CLIENTE - VISITAS

const getVisitas = async (req, res) => {
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

        if(!searchUser) return res.status(404).json({msg: 'No hemos encontrado este usuario.'});
        
        // SI ES EL LIDER ME TRAE TODO.
        if(searchUser.rango == 'lider'){
            // Caso contrario, avanzamos...
            const searchVisita = await visita.findAll({
                where: {
                    state: {
                        [Op.or]: ['active', 'aplazado', 'cancelada']
                    }
                },
                include:[{
                    model: client,
                    include:[{
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
                order: [['createdAt', 'DESC'], [{ model: client}, { model: register}, 'createdAt', 'ASC']],
            }).catch(err => {
                console.log(err);
                return null;
            });
            // Validamos
            if(!searchVisita || !searchVisita.length) return res.status(404).json({msg: 'No hay resultado.'});
            // Caso contrario, envio respuesta
            res.status(200).json(searchVisita);

            // CASO CONTRARIO, SI ES ASESOR ENTONCES POR SUS RESULTADOS.
        }else if(searchUser.rango == 'asesor'){
             // Caso contrario, avanzamos...
             const searchVisita = await visita.findAll({
                where: {
                    state: {
                        [Op.or]: ['active', 'aplazado', 'cancelada']
                    },
                    userId: searchUser.id
                },
                include:[{
                    model: client,
                    include:[{
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
                order: [['createdAt', 'DESC'], [{ model: client}, { model: register}, 'createdAt', 'ASC']],

            }).catch(err => {
                console.log(err);
                return null;
            });
            // Validamos
            if(!searchVisita || !searchVisita.length) return res.status(404).json({msg: 'No hay resultado.'});
            // Caso contrario, envio respuesta
            res.status(200).json(searchVisita);
        }
        

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

const getVisita = async (req, res) => {
    try{
        // Recibo parametros por params
        const { visitaId } = req.params;
        // Validamos
        if(!visitaId) return res.status(501).json({msg: 'Parametro invalido.'});
        // Consultamos todo.
        const searchCall = await visita.findOne({
            where: {
                id: visitaId,
                state: {
                    [Op.or]: ['active', 'aplazado']
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
                model: calendary,
                where: {
                    state: 'active'
                }
            },
            {
                model: user
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

// CREAR VISITA
const createVisita = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { title, clientId, userId, time, hour, contactId } = req.body; 
        // Validamos que entren los datos necesarios
        if(!title || !clientId || !userId || !hour) return res.status(501).json({msg: 'Parametros no validos.'});
 
        // caso contrario, creamos el cliente.
        const createCliente = await visita.create({
            title,
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
                callId: null,
                visitaId: result.id,
                type: 'visita',
                caso: null,
                contacto: null,
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

const cancelVisita = async (req, res) => {
    try{
        const { visitaId, calendaryId, userId, clientId } = req.body;

        const searchVisita = await visita.findOne({
            where:{
                id: visitaId,
                state: 'active'
            },
            include:[{
                model: calendary
            }]
        }).catch(err => {
            console.log(err);
            return null
        })
        // Avanzamos
        if(!searchVisita) return res.status(404).json({msg: 'No hemos encontrado esta visita.'});
        
        // caso contrario, ACTUALIZAMOS A ELIMINADO
        const eliminar = await visita.update({
            state: 'cancelada'
        }, {
            where: {
                id: visitaId
            }
        })
        .then(async (data) => {
            const cancel = await cancelar(calendaryId)
            return cancel;
        })
        .then(async (resultado) => {
            // Type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectId, calendaryId
            const addNote = await addNoteServices('visita', null, null, null, 'Visita cancelada', 'cancelada', 'automatico', userId, clientId, null, visitaId, null, null)
            return resultado
        })
        .catch(err => {
            console.log(err);
            return null
        })
        if(!eliminar) return res.status(502).json({msg: 'no hemos logrado eliminar esto.'});
        // Caso contrario, respondemos
        res.status(200).json({msg: 'Visita cancelada con exito.'});
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}


// Aplazar
const aplazarVisita = async(req, res) => {
    try{
        // Recibimos los datos por body
        const { title, note, tags, visitaId, userId, clientId, calendaryId, time, hour } = req.body;
        // Validamos
        if(!title || !clientId || !userId || !calendaryId || !time || !hour) res.status(501).json({msg: 'Parametros no validos.'});
        // Caso contrario, avanzamos
        // Actualizamos el estado.
        const updateCall = await visita.update({
            state: 'aplazado',
        }, {
            where: {
                id: visitaId
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
                visitaId,
                type: 'visita',
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
const SinInteresVisita = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const {visitaId, userId, clientId, nota, tags, calendaryId } = req.body; 
        // Validamos datos del servidor

        if(!visitaId || !clientId || !calendaryId) return res.status(501).json({msg: 'Parametros no son validos.'});

        // Caso contrario
        const visitaLost = await visita.update({
            state: 'perdido', 
        }, {
            where: {
                id: visitaId
            }
        })
        .then(async (result) => {
            // type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectId, calendaryId,
            const updateCalendario = await cumplido(calendaryId, 'perdido')
            .then(async () => {
                const newNote = await addNoteServices('visita', null, null, tags, nota, 'perdido', 'automatico', userId, clientId, null, visitaId, null, calendaryId) 
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

        if(!visitaLost) return res.status(502).json({msg:'No hemos logrado actualizar esto.'});

        // caso contrario
        res.status(200).json({msg: 'Actualizado con exito.'});
    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// AGENDAR COTIZACIÓN
const agendaCotizacion = async (req, res) => {
    try{
        const { visitaId, clientId, userId, calendaryId,
            name, nit, nro, fecha, bruto, iva, descuento, neto, state
        } = req.body;
    
        if(!visitaId || !clientId || !userId || !calendaryId ) return res.status(501).json({msg: 'Los parametros no son validos.'});

        // Caso contrario, avanzamos
        const callOk = await visita.update({
            state: 'cumplida',
        }, {
            where: {
                id:visitaId
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

module.exports = {
    getVisitas,
    createVisita,
    cancelVisita,
    aplazarVisita,
    SinInteresVisita,
    getVisita,
    agendaCotizacion // Agendar cotización
} 