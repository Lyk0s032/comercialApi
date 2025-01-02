const express = require('express');
const { client, call, register, visita, calendary, user } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');
const dayjs = require('dayjs');
const { cancelar } = require('./services/calendaryServices');
const { addNoteServices } = require('./services/notesServices');
const { searchUserServices } = require('./services/userService');

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
                    state: 'active'
                },
                include:[{model: user},{
                    model: client
                }, {
                    model: calendary
                }, {
                    model: register
                }]
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
                    state: 'active',
                    userId: searchUser.id
                },
                include:[{
                    model: client
                }, {
                    model: calendary
                }, {
                    model: register
                }]
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
        const { callId } = req.params;
        // Validamos
        if(!callId) return res.status(501).json({msg: 'Parametro invalido.'});
        // Consultamos todo.
        const searchCall = await call.findOne({
            where: {
                id: callId,
                state: 'active'
            }
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
        const { title, clientId, userId, time, hour } = req.body; 
        // Validamos que entren los datos necesarios
        if(!title || !clientId || !userId || !hour) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const createCliente = await visita.create({
            title,
            clientId,
            userId,
            state: 'active' 
        })
        .then(async (result) => {
            // CREAMOS EL BODY PARA AGREGAR EVENTO AL CALENDARIO
            let body = {
                userId,
                clientId,
                callId: result.id,
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


// No contesto
// const DontCall = async (req, res) => {
//     try{
//         // Recibo toda la informacion por body
//         const {callId, title, userId, clientId, caso,  time, hour } = req.body; 
//         // Validamos que entren los datos necesarios

//         const fecha = dayjs(time) // Esta fecha es la que tiene el calendario activo.
//         // Agregamos 3 dias
//         const newFecha = fecha.add(3, 'day');
//         if(!callId || !time || !hour ) res.status(501).json({msg: 'Parametros no validos.'});
//         if(caso == "contacto 2" || caso == "contacto 3"){
            
//             // caso contrario, creamos el cliente.
//             const updateClient = await call.update({
//                 title,
//                 case: caso, // Contacto 1, contacto 2
//                 // , contacto 3.
//             }, {
//                 where: {
//                     id: callId
//                 }
//             })
//             .then(async (upd) => {
//                 const updateCalendary = await calendary.update({
//                     state: 'aplazado',
//                 }, {
//                     where: {
//                         callId
//                     }
//                 }).catch(err => {
//                     console.log('err')
//                     return null;
//                 })

//                 return 1
//             })
//             .then(async(res) => {
//                 // CREAMOS EL BODY PARA AGREGAR EVENTO AL CALENDARIO
//                 let body = {
//                     userId,
//                     clientId,
//                     callId,
//                     type: 'contacto',
//                     caso: caso,
//                     contacto: caso,
//                     note: title,
//                     time: newFecha,
//                     hour
//                 }
//                 const toCalendar = await axios.post('/api/calendario/new/', body)
//                 .then((res) => res.data)
//                 .then((data) => {
//                     console.log('cumple la funcion')
//                     return data
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     console.log('No hemos logrado conectar la funcion')
//                     return null;
//                 })

//                 return res
//             })
//             .catch(err => {
//                 console.log(err);
//                 return null;
//             });

//             if(!updateClient) return res.status(502).json({msg: 'No hemos logrado crear esto.'});
//             // Caso contrario, enviamos respuesta.
//             return res.status(201).json({msg: 'Aplazado con exito.'});
//         }else{
//             const lostCall = await call.update({
//                 state: 'perdido'
//             }, {
//                 where: {
//                     id: callId
//                 }
//             })
//             .then( async (res) => {
//                 const cancelCalendary = await calendary.update({
//                     state: 'cancelado'
//                 },{
//                     where: {
//                         callId,
//                         state: 'active'
//                     }
//                 }).catch(err => {
//                     console.log(err);
//                     return null
//                 });

//                 return res 
//             })
//             .catch(err => {
//                 console.log(err);
//                 return null;
//             });

//             if(!lostCall) return res.status(502).json({msg:'No logramos actualizar esto.'});
            
//             // Caso contrario, avanzamos
//             return res.status(200).json({msg: 'Enviado a perdidos.'});
//         }

//     }catch(err ){
//         console.log(err);
//         res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
//     }
// }


module.exports = {
    getVisitas,
    createVisita,
    cancelVisita  
} 