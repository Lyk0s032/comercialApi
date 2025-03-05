const express = require('express');
const { client, user, calendary, cotizacion } = require('../db/db');
const { Op } = require('sequelize');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addNoteServices } = require('./services/notesServices');
const { addCotizacion, editCotizacion, updateState } = require('./services/cotizacionService');
const res = require('express/lib/response');
const dayjs = require('dayjs');
const { aplazado, cumplido } = require('./services/calendaryServices');
const { default: axios } = require('axios');

// CONTROLADORES DE COTIZACIONES
// OBTENER TODAS LAS COTIZACIONES
const getCotizacionById = async ( req, res) => {
    try{
        // Recibimos datos por params
        const { cotizacionId } = req.params;
        // Validamos que la cotización entre correctamente
        if(!cotizacionId) return res.status(501).json({msg: 'Los parámetros no son validos.'});

        // Caso contrario, procedemos a hacer la consulta.
        const searchCoti = await cotizacion.findOne({
            where: {
                id: cotizacionId,
                state: {
                    [Op.or]: ['pendiente', 'desarrollo', 'aplazado']
                },
            },
            include:[{
                model: calendary
            }, {
                model: client
            }, {
                model: user
            }]
        })
        .catch(err => null);

        if(!searchCoti) return res.status(404).json({msg: 'No hay resultados.'});
        // Caso contrario, enviamos respuesta
        return res.status(200).json(searchCoti);
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}

const getThisMonthCotizacion = async (req, res) => {
    try{
        const { userId, ano, month } = req.params;
        if(!userId || !ano || !month) return res.status(500).json({msg: 'Parametros no validos'});
        // Caso contrario.
        // Buscamos usuario
        
        const searchUser = await user.findByPk(userId).catch(err => null);
        const inicioMes = dayjs(`${ano}-${month}-06` ) // Primer día del mes en UTC
        const finMes = dayjs(`${ano}-${Number(month)+Number(1)}-06` ) // Último día del mes en UTC

        if(!searchUser) return res.status(404).json({msg: 'No hemos encontrado este usuario.'});
        // Caso contrario
        
        if(searchUser.rango == 'lider'){
            const searchCotizaciones = await cotizacion.findAll({
                where: {
                    state: 'aprobada',
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()]
                    }
                },
                include:[{
                    model:client
                }, {
                    model: user
                }]
            }).catch(err => {
                console.log(err);
                return null
            });

            if(!searchCotizaciones || !searchCotizaciones.length) return res.status(404).json({msg: 'Sin resultados'});
            res.status(200).json(searchCotizaciones);
        }else{
            const searchCotizaciones = await cotizacion.findAll({
                where: {
                    state: 'aprobada',
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()]
                    },
                    userId: userId
                },
                include:[{
                    model:client
                }, {
                    model: user
                }]
            }).catch(err => {
                console.log(err);
                return null
            });

            if(!searchCotizaciones || !searchCotizaciones.length) return res.status(404).json({msg: 'Sin resultados'});
            res.status(200).json(searchCotizaciones);
        }
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido en la principal'});
    }
}
const getAllCotizacions = async (req, res) => {
    // Buscamos las ACTIVAS , EN DESARROLLO , EN ESPERA
    try{
        const { userId } = req.params;
        const searchUser = await user.findByPk(userId)
        .catch(err => null);

        if(!searchUser) return res.status(404).json({msg: 'No hemos encontrado este usuario'});
        // Caso contrario, avanzamos..

        if(searchUser.rango == 'lider'){
            const searchCoti = await cotizacion.findAll({
                where: {
                    state: {
                        [Op.or]: ['pendiente', 'desarrollo', 'espera', 'perdido']
                    }
                },
                include:[{
                    model: calendary
                }, {
                    model: client
                }, {
                    model: user
                }]
            })
            .catch(err => null);

            if(!searchCoti || !searchCoti.length) return res.status(404).json({msg: 'No hay resultados.'});
            // Caso contrario, enviamos respuesta
            return res.status(200).json(searchCoti);

        }else if(searchUser.rango == 'asesor'){
            const searchCoti = await cotizacion.findAll({
                where: {
                    state: {
                        [Op.or]: ['pendiente', 'desarrollo', 'aplazado', 'perdido']
                    },
                    userId: userId
                },
                include:[{
                    model: calendary
                }, {
                    model: client
                }, {
                    model: user
                }]
            })
            .catch(err => null);

            if(!searchCoti || !searchCoti.length) return res.status(404).json({msg: 'No hay resultados.'});
            // Caso contrario, enviamos respuesta
            return res.status(200).json(searchCoti);
        }
        
        
    }catch(err){
        console.log(err);
        return res.status(404).json({msg: 'Ha ocurrido un error en la principal.'});

    }
}
// CREAR EVENTO EN EL CALENDARIO
const addCotizacionToCRM = async (req, res) => {
    try{
        // Recibimos todos los datos por body,
        const { name, nit, nro, fecha, bruto, iva, descuento, neto, userId, clientId, state } = req.body;

        // Validamos los datos necesarios.
        if(!name || !clientId) return res.status(200).json({msg: 'Parametros invalidos'});
        // Caso contrario, avanzamos...
        // name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId
        const addCoti = await addCotizacion(name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId, state)
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
        const { cotizacionId, calendaryId, state } = req.body;
        // Validamos
        if(!cotizacionId || !state) return res.status(501).json({msg: 'Los parametros no son validos.'});

        // Caso contrario, avanzamo
        const updateCoti = await updateState(cotizacionId, state)
        .then((resultado) => {
            if(res == 502) return null
            return resultado
        }) 
        .then(async (res) => {
            if(calendaryId){
                const cumplida = await cumplido(calendaryId, null)
                return res

            }
            return res
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
// COTIZACION EN DESARROLLO
const addCotiDesarrollo = async (req, res) =>{
    try{
        const { name, userId, clientId, callId, visitaId,
            nit, nro, fecha, bruto, iva, descuento, neto, state } = req.body;
         
        // Validamos que los datos entren correctamente
        if(!name || !userId || !clientId) return res.status(501).json({msg: 'Parametros invalidos'});
        // Caso contrario, seguimos
        const date = dayjs();
        const note = state == 'desarrollo' ? `Se ha separado un espacio de cotización - ${name}` : `Se ha creado una cotización - ${name}`;
        const addCotizacion = await cotizacion.create({
            name,
            nit, 
            nro,
            fecha: fecha ? fecha : date,
            fechaAprobada: null,
            bruto,
            descuento,
            iva,
            neto,
            clientId,
            userId,
            state
        })
        .then(async (result) => {
            // type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectId, calendaryId,
            const addRegister = await addNoteServices('cotizacion', null, null, null, note, null, 'automatico', userId, clientId, callId, visitaId, null, null, result.id)
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

        if(!addCotizacion) return res.status(502).json({msg: 'No hemos logrado crear esto.'});
        // Caso contrario, enviamos el registro
        res.status(201).json(addCotizacion)
         
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}

// Aplazar cotización
// Aplazar
const aplazarCotizacion = async(req, res) => {
    try{
        // Recibimos los datos por body
        const { title, cotizacionId, userId, clientId, calendaryId, time, hour } = req.body;
        // Validamos
        if(!title || !clientId || !userId || !time || !hour) res.status(501).json({msg: 'Parametros no validos.'});
        // Caso contrario, avanzamos
        // Actualizamos el estado.
        const updateCall = await cotizacion.update({
            state: 'aplazado',
        }, {
            where: {
                id: cotizacionId
            }
        })
        .then(async(result) => {
            if(calendaryId){
                const aplazar = await aplazado(calendaryId)
                return result
            }
            return result
        })
        .then(async(data) => {
            let body = {
                userId,
                clientId,
                cotizacionId,
                type: 'cotizacion',
                note: `Cotización aplazada para el ${time}`,
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



module.exports = {
    updateCotizacionToCRM,
    addCotizacionToCRM,
    changeStateCotizacion, 
    addCotiDesarrollo, // Espacio para cotización en desarrollo.
    aplazarCotizacion,
    getAllCotizacions,
    getCotizacionById, // Obtener cotización particular.
    getThisMonthCotizacion
}