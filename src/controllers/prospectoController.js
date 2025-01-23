const express = require('express');
const { tag, fuente, prospecto, register, client, calendary } = require('../db/db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { newProspecto, addTag, newFuente, removeTag, updateFuente, getAllTags, getFuentes } = require('./services/prospectoService');
const dayjs = require('dayjs');
const { default: axios } = require('axios');
const { aplazado } = require('./services/calendaryServices');
const { addNoteServices } = require('./services/notesServices');


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
        const searchProspectos = await prospecto.findAll({
            where: {
                state: {
                    [Op.in]: ['intento 1', 'intento 2', 'intento 3'] // Filtra por los tres valores
              }
            },
            include:[{
                model: calendary
            }, {
                model: register
            }]
        })
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
        if(!prospectoId || !userId || !calendaryId || !time || !hour) return res.status(501).json({msg: 'Parametros no validos.'});
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

// Convertir a cliente
const convertirToClient = async(req, res) => {
    try{
        // Recibimos datos por parámetro
        const { photo, prospectoId, 
            nombreEmpresa, nit, phone, email, type, sector, responsable, url, direccion, fijo, ciudad
        } = req.body;
        // Validamos que los parametros entren
        if(!prospectoId || !responsable || !phone || !type) return res.status(501).json({msg: 'Parametros invalidos.'})
            
            let defaultPerson = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
            let defaultDistribuidor = 'https://professorm.org/wp-content/uploads/google-my-business-logo-500.png';
            let businessDefault = 'https://cdn-icons-png.flaticon.com/512/10839/10839543.png';

            let wallpaper = photo ? photo : type == 'persona' ? defaultPerson : type == 'distribuidor' ? defaultDistribuidor : businessDefault

        // Caso contrario, avanzamos...
        const createClient = await client.create({
            photo: wallpaper,
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
        })
        .then( async (res) => {
            console.log('Creado.')

            const updateProspecto = await prospecto.update({
                state: 'cliente'
            }, {
                where: {
                    id: prospectoId
                }
            })
            .then((res) => {
                console.log('Actualizado')
            })

            return res
        })
        .catch((err) => {
            console.log(err);
            console.log('Error en la creción')
        });

        if(!createClient) return res.status(502).json({msg: 'No hemos podido crear esto.'});

        // Caso contrario, enviamos respuesta
        res.status(201).json(createClient);

    }catch(err){
        console.log(err);
        return 500
    }
}

// No tuvo interes
const NoInteresProspecto = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const {prospectoId, userId, contacto, nota, tags } = req.body; 
        // Validamos datos del servidor

        if(!prospectoId  ) return res.status(501).json({msg: 'Parametros no son validos.'});

        // Caso contrario
        const CallLost = await prospecto.update({
            state: 'perdido', 
        }, {
            where: {
                id: prospectoId,
            }
        })
        .then(async (result) => {
            const newNote = await addNoteServices('prospecto', null, prospectoId, tags, nota, 'perdido', 'automatico', userId, null, null, null, null, null) 
            return newNote;
        }).catch(err => {
            console.log(err);
            return false
        })

        if(!CallLost) return res.status(502).json({msg:'No hemos logrado actualizar esto.'});

        // caso contrario
        res.status(200).json({msg: 'Actualizado con exito.'});
    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// Crear función para pasar de prospecto a cliente
// Después, agendar visita o llamada.
// Después, no tiene interés.
//
// Hacer panel de llamadas, visitas y cotizaciones.
//
module.exports = {
    getAllTagsAndFuentes, // Funcion para obtener tags y fuentes
    newTag,
    deleteTags,
    nuevaFuente,
    deleteFuente,
    newProspect,
    getAllProspectos,
    // EMBUDO   -   
    DontCallProspecto, // NO CONTESTO
    aplazarProspecto, // APLAZO
    convertirToClient, // Convertir a cliente.
    NoInteresProspecto,
}