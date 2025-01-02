const express = require('express');
const { tag, fuente, prospecto, client, calendary } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { newProspecto, addTag, newFuente, removeTag, updateFuente, getAllTags, getFuentes } = require('./services/prospectoService');
const dayjs = require('dayjs');
const { default: axios } = require('axios');
const { aplazado } = require('./services/calendaryServices');


// Obtener todos los tags y fuentes
const getAllTagsAndFuentes = async (req, res) => {
    try {
        // Consultamos dos funciones de nuestro paquete "services."
        // Dividimos las respuesta en dos.

        const getTg = await getAllTags()
        .then((res) => {
            return res
        }).catch(err => {
            console.log(err);
            return null;
        });

        // Obtenemos las fuentes
        const getFt = await getFuentes()
        .then((res) => {
            return res
        }).catch(err => {
            console.log(err);
            return null;
        });

        // Creamos una variable que almacena ambas respuesta.
        const system = {
            tags: getTg,
            fuentes: getFt
        }
        return res.status(200).json(system);
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
// Nuevo tag ----
const newTag = async (req, res) => {
    try{
        // Recibimos todos los datos por body
        const { name, type } = req.body;

        // Validamos los datos necesarios.
        if(!name || !type) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const newTags = await addTag(name, type)
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!newTag) return res.status(502).json({msg:'No hemos podido trer esto.'});
        // Caso contrario, mostramos la creacion
        res.status(201).json(newTags);
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// Delete tags
const deleteTags = async (req, res) => {
    try{
        // Recibimos dato por body
        const { id } = req.params;
        // Validamos que los datos entren correctamente
        if(!id) return res.status(501).json({msg: 'Parametro invalido.'});

        // Caso contrario, avanzamos
        const del = await removeTag(id)
        .then((res) => {
            console.log('Eliminado')
            return res
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!del) return res.status(502).json({msg: 'No hemos logrado eliminar esto.'});

        // Caso contrario
        res.status(200).json({msg: 'Tag eliminado'});
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
// Desactivamos la fuente
const deleteFuente = async (req, res) => {
    // ACLARACION DE LA FUNCION
    // ---------
    //  Esta funcion no remueve el registro de la base de datos, solo cambia el estado a Inactivo.
    // ---------
    try{
        // Recibimos id por body
        const { id } = req.body;
        // Validamos que entre correctamente
        if(!id) return res.status(500).json({msg: 'Parametros invalidos.'});
        
        // Caso contrario, avanzamos...

        const delFuente = await updateFuente(id)
        .then(res => {
            return res
        }) 
        .catch(err => {
            console.log(err);
            return null
        });
        // Validamos la respuesta de la funcion
        if(!delFuente) return res.status(502).json({msg: 'No hemos podido crear esto.'});
        // Caso contrario
        return res.status(200).json({msg: 'Fuente eliminada con exitos'});
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
// Nueva fuente
const nuevaFuente = async (req, res) => {
    try{
        // Recibimos todos los datos por body
        const { name, type } = req.body;

        // Validamos los datos necesarios.
        if(!name || !type) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const newTags = await newFuente(name, type)
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!newTag) return res.status(502).json({msg:'No hemos podido trer esto.'});
        // Caso contrario, mostramos la creacion
        res.status(201).json(newTags);
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// New Prospecto
const newProspect = async (req, res) => {
    try{
        // Recibimos datos por body
        const {nombreEmpresa, namePersona, phone, email, type, cargo, url, direccion, city, fijo, fuenteId} = req.body;
        // Validamos que los parametros lleguen correctamente.

        if(!namePersona || !phone || !fuenteId) return res.status(501).json({msg: 'Parametros invalidos.'})

        const add = await newProspecto(nombreEmpresa, namePersona, phone, email, type, cargo, url, direccion, city, fijo, fuenteId)
        .then((res) => {
            console.log('entra')
            return res
        })
        .catch(err => {
            console.log(err);
            return null;
        })

        res.status(200).json({msg: 'Termino'})

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'Ha ocurrido un error en la principal.'});
    }
}

const getAllProspectos = async (req, res) => {
    try{
        // Buscamos todos los prospectos
        const searchProspectos = await prospecto.findAll()
        .catch(err => {
            console.log(err);
            return null;
        })
        if(!searchProspectos || !searchProspectos.length) return res.status(404).json({msg: 'No hemos encontrado esto.'});
        // Caso contrario
        res.status(200).json(searchProspectos)
    }catch(err){ 
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal'})
    }
}


// No contesto
const DontCallProspecto = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const {prospectoId, title, userId, caso,  time, hour } = req.body; 
        // Validamos que entren los datos necesarios

        const fecha = dayjs(time) // Esta fecha es la que tiene el calendario activo.
        // Agregamos 3 dias
        const newFecha = fecha.add(3, 'day');
        if(!prospectoId || !time || !hour ) res.status(501).json({msg: 'Parametros no validos.'});
        if(caso == "intento 2" || caso == "intento 3"){
            
            // caso contrario, creamos el cliente.
            const updateClient = await prospecto.update({
                state: caso, // Contacto 1, contacto 2 // , contacto 3.
            }, {
                where: {
                    id: prospectoId
                }
            })
            .then(async(res) => {
                // CREAMOS EL BODY PARA AGREGAR EVENTO AL CALENDARIO
                let body = {
                    userId,
                    prospectoId,
                    type: 'prospecto',
                    caso: caso,
                    contacto: null,
                    prospectos: caso,
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
            const lostCall = await prospecto.update({
                state: 'perdido'
            }, {
                where: {
                    id: prospectoId
                }
            })
            .then( async (res) => {
                const cancelCalendary = await calendary.update({
                    state: 'cancelado'
                },{
                    where: {
                        prospectoId,
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
const aplazarProspecto = async(req, res) => {
    try{
        // Recibimos los datos por body
        const { title, note, tags, userId, prospectoId, calendaryId, time, hour } = req.body;
        // Validamos
        if(!title || !prospectoId || !userId || !calendaryId || !time || !hour) return res.status(501).json({msg: 'Parametros no validos.'});
        // Caso contrario, avanzamos
        // Actualizamos el estado.
        const updateCall = await prospecto.update({
            state: 'intento 1',
        }, {
            where: {
                id: prospectoId
            }
        })
        .then(async(result) => {
            const aplazadoVar = await aplazado(calendaryId)
            return result
        }) 
        .then(async(data) => {
            let body = {
                userId,
                prospectoId,
                type: 'prospecto',
                caso: 'intento 1',
                contacto: null,
                prospectos: 'intento 1',
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
module.exports = {
    getAllTagsAndFuentes, // Funcion para obtener tags y fuentes
    newTag,
    deleteTags,
    nuevaFuente,
    deleteFuente,
    newProspect,
    getAllProspectos,
    // EMBUDO
    DontCallProspecto, // NO CONTESTO
    aplazarProspecto // APLAZO
}