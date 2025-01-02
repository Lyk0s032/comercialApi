const express = require('express');
const { client, calendary, register } = require('../db/db');
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

module.exports = {
    addNote,
}