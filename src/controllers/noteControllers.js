const express = require('express');
const { client, call, visita, user, calendary, register } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CONTROLADORES DEL CLIENTE
// CREAR NOTA DE REGISTRO
const addNote = async (req, res) => {
    try{
        // Recibimos todos los datos por body
        const { userId, clientId, callId, visitaId, prospectId, calendaryId,  
        type, contacto, prospecto, tags, note, extra, manual } = req.body;

        // Validamos los datos necesarios.
        if(!note || !type || !userId ) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const addNote = await register.create({
            type: type,
            prospecto, // aplica si es en prospecto
            contacto, // Aplica si en contacto
            tags,
            note,
            extra: extra, // Aplica si esta en espera o en perdido.
            callId,
            clientId,
            manual,
            userId,
            calendaryId,
            visitumId: visitaId
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!addNote) return res.status(404).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos el registro
        res.status(200).json(addNote);
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

const addNoteManual = async(req, res) => {
    try{
        // Recibimos datos por body
        const { userId, clientId, 
        callId, visitaId, prospectId, type, contacto, prospecto, note, cotizacionId} = req.body;
    
                
        const addNote = await register.create({
            type: type, 
            prospecto, // aplica si es en prospecto
            contacto, // Aplica si en contacto
            tags: null,
            note,
            extra: null, // Aplica si esta en espera o en perdido.
            callId,
            clientId,
            manual: 'manual',
            userId,
            prospectoId: prospectId,
            calendaryId: null,
            visitumId: visitaId,
            cotizacionId
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!addNote) return res.status(404).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos el registro

        if(callId){
            const searchCall = await call.findOne({
                where: {
                    state: 'active',
                    id: callId
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
                }],
                order: [['createdAt', 'DESC'], [{ model: client}, { model: register}, 'createdAt', 'ASC']],
            }).catch(err => {
                console.log(err);
                return null;
            });
            // Validamos
            if(!searchCall) return res.status(404).json({msg: 'No hay resultado.'});
            // Caso contrario, envio respuesta
            return res.status(201).json(searchCall);
        }else if(visitaId){
            const searchVisita = await visita.findOne({
                where: {
                    id: visitaId
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
                }],
                order: [['createdAt', 'DESC'], [{ model: client}, { model: register}, 'createdAt', 'ASC']],

            }).catch(err => {
                console.log(err);
                return null;
            });
            // Validamos
            if(!searchVisita) return res.status(404).json({msg: 'No hay resultado.'});
            // Caso contrario, envio respuesta
            return res.status(201).json(searchVisita);
        }

        res.status(200).json({msg: 'ingresar'})
        
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal'})
    }
}
module.exports = {
    addNote, // Esta nota es automatica
    addNoteManual, // Esta nota es manual
}