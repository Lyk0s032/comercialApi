const express = require('express');
const { client, calendary } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addNoteServices } = require('./services/notesServices');
const { addCotizacion, editCotizacion, updateState } = require('./services/cotizacionService');

// CONTROLADORES DEL CLIENTE
// CREAR EVENTO EN EL CALENDARIO
const addCotizacionToCRM = async (req, res) => {
    try{
        // Recibimos todos los datos por body,
        const { name, nit, nro, fecha, bruto, iva, descuento, neto, userId, clientId } = req.body;

        // Validamos los datos necesarios.
        if(!name || !nit || !userId || !nro  ||  !fecha || !bruto || !descuento || !neto || !clientId) return res.status(200).json({msg: 'Parametros invalidos'});
        // Caso contrario, avanzamos...
        // name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId
        const addCoti = await addCotizacion(name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId)
        .then((res) => {
            console.log('Crea la cotizacion');
            return res
        }).catch(err => {
            console.log(err);
            return null
        })

        if(!addCoti) return res.status(502).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos el registro
        res.status(201).json(addCoti);
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

const updateCotizacionToCRM = async (req, res) => {
    try{
        // Recibimos todos los datos por body,
        const { name, nit, nro, fecha, bruto, iva, descuento, neto, userId, clientId, cotizacionId, state } = req.body;

        // Validamos los datos necesarios.
        if(!clientId || !cotizacionId) return res.status(200).json({msg: 'Parametros invalidos'});
        // Caso contrario, avanzamos...
        // name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId
        const addCoti = await editCotizacion(name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId, cotizacionId, state)
        .then((res) => {
            if(res == 404){
                return 404;
            }
            console.log('Actualiza la cotizacion');
            return res
        }).catch(err => {
            console.log(err);
            return null
        })
        if(addCoti == 404) res.status(404).json({msg:'No hemos encontrado esta cotizacion'});

        if(!addCoti) return res.status(502).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario, enviamos el registro
        res.status(201).json(addCoti);
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


const changeStateCotizacion = async (req, res) => {
    try{
        // Recibimos datos por body
        const { cotizacionId, state } = req.body;
        // Validamos
        if(!cotizacionId || !state) return res.status(501).json({msg: 'Los parametros no son validos.'});

        // Caso contrario, avanzamo
        const updateCoti = await updateState(cotizacionId, state)
        .then((resultado) => {
            if(res == 502) return null
            return resultado
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!updateCoti) return res.status(502).json({msg: 'No hemos logrado actualizar esto.'});
        // Caso contrario, avanzamos
        res.status(200).json({msg: 'Actualizada con exito'})
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}

module.exports = {
    updateCotizacionToCRM,
    addCotizacionToCRM,
    changeStateCotizacion
}