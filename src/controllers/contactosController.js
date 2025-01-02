const express = require('express');
const { client, contact } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CONTROLADORES DEL CLIENTE

const getAllContacts = async (req, res) => {
    try{
        // Consultamos todo.
        const searchContacts = await contact.findAll({
            where: {
                state: 'active'
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchContacts || !searchContacts.length) return res.status(404).json({msg:'Sin resultados.'});
        // Caso contrario, enviamos resultados.
        res.status(200).json(searchContacts)
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// CREAR CLIENTE
const createContact = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { clientId, asesorId, nombre, phone, email, rango } = req.body; 
        // Validamos que entren los datos necesarios
        if(!nombre || !phone) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const createContact = await contact.create({
            nombre,
            phone,
            email,
            rango, // Cargo dentro del cliente
            state: 'active',
            clientId,
            userId: asesorId
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!createContact) return res.status(502).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json(createContact);

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// ACTUALIZAR CONTACTO
const updateContact = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { contactId, asesorId, nombre, phone, email, rango } = req.body; 
        // Validamos que entren los datos necesarios
        if(!contactId) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const updateContacto = await contact.update({
            nombre,
            phone,
            email,
            rango, // Cargo dentro del cliente
            state: 'active',
        },{
            where: {
                id: contactId
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!updateContacto) return res.status(502).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json({msg: 'Contacto actualizado con exito'});

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


// ELIMINAR CONTACTO
const deleteContact = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { contactId } = req.body; 
        // Validamos que entren los datos necesarios
        if(!contactId) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const deleteContacto = await contact.destroy({
            where: {
                id: contactId
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!deleteContacto) return res.status(502).json({msg: 'No hemos podido eliminar crear esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(200).json({msg: 'Eliminado con exito'});

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


module.exports = {
    getAllContacts,
    createContact,
    updateContact,
    deleteContact
}