const express = require('express');
const { client } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// CONTROLADORES DEL CLIENTE

const getAllClients = async (req, res) => {
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
// CREAR CLIENTE
const createClient = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { nombreEmpresa, nit, phone, email, type, sector, responsable, url, direccion, fijo, ciudad } = req.body; 
        // Validamos que entren los datos necesarios
        if(!nombreEmpresa || !phone || !type) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const createClient = await client.create({
            nombreEmpresa,
            nit,
            phone,
            email,
            type, // Distribuidor o cliente varios
            sector,
            responsable,
            url,
            direccion,
            fijo,
            ciudad,
            state: 'active'
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!createClient) return res.status(502).json({msg: 'No hemos odido crear esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json(createClient);

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// ACTUALIZAR CLIENTE
const updateCliente = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { clientId, nombreEmpresa, nit, phone, email, type, sector, responsable, url, direccion, fijo, ciudad } = req.body; 
        // Validamos que entren los datos necesarios
        if(!clientId) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const updateClient = await client.update({
            nombreEmpresa,
            nit,
            phone,
            email,
            type, // Distribuidor o cliente varios
            sector,
            responsable,
            url,
            direccion,
            fijo,
            ciudad,
            state: 'active'
        }, {
            where: {
                id: clientId
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!updateClient) return res.status(502).json({msg: 'No hemos odido crear esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json({msg: 'Actualizado con exito'});

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

module.exports = {
    getAllClients,
    createClient,
    updateCliente
} 