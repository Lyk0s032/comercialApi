const express = require('express');
const { client, calendary } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addNoteServices } = require('./services/notesServices');

// CONTROLADORES DEL CLIENTE
// CREAR EVENTO EN EL CALENDARIO
const newEvent = async (req, res) => {
    try{
        // Recibimos todos los datos por body
        const { userId, clientId, callId, visitaId, prospectoId,  
        contacto, prospectos, tags, type, caso, note, time, hour, extra, state } = req.body;

        // Validamos los datos necesarios.
        if(!note || !type || !time || !hour ) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const addEvento = await calendary.create({
            type: type,
            prospectos, // aplica si es en prospecto
            contacto, // Aplica si en contacto
            case: caso, // Aplica si es en contacto o prospecto
            note,
            time,
            hour,
            extra: extra, // Aplica si esta en espera o en perdido.
            callId,
            clientId,
            prospectoId,
            visitumId: visitaId,
            userId,
            state: 'active' // Hay momentos, donde se crea un registro en calendario, pero en Cumplido
        })
        .then(async (result) => {
            // type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectId, calendaryId,
            const addRegister = await addNoteServices(type, contacto, prospectos, tags, note, extra, 'automatico', userId, clientId, callId, visitaId, prospectoId, result.id)
            if(addRegister == 404){
                return null
            }else{
                return result
            }
        })
        .catch(err =>{
            console.log(err);
            return null;
        });

        if(!addEvento) return res.status(404).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos el registro
        res.status(200).json(addEvento);
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
const getCalendary = async (req, res) => {
    try{
        // Consultamos todo.
        const searchClient = await client.findAll({
            where: {
                state: 'active'
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchClient || !searchClient.length) return res.status(404).json({msg:'Sin resultados.'});
        // Caso contrario, enviamos resultados.

        res.status(200).json(searchClient)

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


module.exports = {
    getCalendary,
    newEvent
}