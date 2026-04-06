const express = require('express');
const { tag, fuente, prospecto, register, client, calendary, dataProspect } = require('../db/db');
const { Op, Sequelize } = require('sequelize');
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
// Obtener fuente
const getFuente = async (req, res) => {
    try{
        const { nameFuente } = req.params;
        // Validamos que entre
        if(!nameFuente) return res.status(501).json({msg: 'No reconocemos este nombre'})
    
        // Caso contrario, avanzamos
        const searchFuente = await fuente.findOne({
            where: {
                nombre: nameFuente,
                state: 'active'
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchFuente) return res.status(404).json({msg: 'No reconocemos esta fuente'});
        // Caso contrario
        res.status(200).json(searchFuente);

    }catch(err){    
        console.log(err);
        res.status(500).json({msg:'ha ocurrido un error en la principal.'});
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
    try {
        const { 
            nombreEmpresa, namePersona, phone, email, 
            type, cargo, url, direccion, city, 
            fijo, fuenteId, mensaje 
        } = req.body;

        // 1. Validación temprana (Fail-fast)
        if (!namePersona || !phone || !fuenteId) {
            return res.status(400).json({ msg: 'Faltan campos obligatorios: nombre, teléfono o fuente.' });
        }

        // 2. Ejecución limpia con await
        // Asegúrate de que el orden de los parámetros coincida con la definición de la función
        const result = await newProspecto(
            nombreEmpresa, namePersona, phone, email, 
            type, cargo, url, direccion, city, 
            fijo, fuenteId, mensaje 
        );

        // 3. Respuesta lógica
        if (!result) {
            return res.status(400).json({ msg: 'No se pudo crear el prospecto. Verifique los datos.' });
        }

        return res.status(201).json(result); // 201 significa "Created"

    } catch (err) {
        console.error("Error en New Prospecto:", err);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
}

// Ruta 
// controllers/prospectExternal.controller.js

const newProspectExternal = async (req, res) => {
    try {
      // Nombres externos (bonitos)
      const { contactName, phone, email, sourceId, message } = req.body;
  
      // Validación mínima
      if (!contactName || !phone || !sourceId) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'contactName, phone and sourceId are required'
        });
      }
      let type = 'digital';
      // Mapping a nombres internos (legacy)
      const result = await newProspecto(
        null,            // nombreEmpresa
        contactName,     // namePersona
        phone,
        email || null, 
        type,            // type
        null,            // cargo
        null,            // url
        null,            // direccion
        null,            // city
        null,            // fijo
        sourceId,        // fuenteId
        message || null
      );
  
      if (!result) {
        return res.status(400).json({
          error: 'CREATION_FAILED',
          message: 'Prospect could not be created'
        });
      }
  
      return res.status(201).json({
        id: result.id,
        status: 'created'
      });
  
    } catch (err) {
      console.error('Error en New Prospect External:', err);
      return res.status(500).json({
        error: 'INTERNAL_ERROR'
      });
    }
  };
  
  
  

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
            }, {
                model: fuente
            }],
            order: [['createdAt', 'DESC']]
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
// ══════════════════════════════════════════════════════════════════════
//  GET /prospecto/getAllWithData
//  Prospectos + dataProspect con filtros combinables por query params.
//
//  Filtros disponibles (todos opcionales y combinables):
//   - desde / hasta      → rango de fechas (createdAt). Si se usa,
//                          se incluyen TODOS los estados.
//                          Sin rango → solo intento 1, 2 y 3.
//   - fuenteId           → filtra por fuente del prospecto
//   - venta              → 'true' | 'false' — campo en dataProspect
//   - asesorAsignado     → ID del asesor en dataProspect
//   - valorCotizadoMin   → valor mínimo cotizado (numérico)
//   - valorCotizadoMax   → valor máximo cotizado (numérico)
// ══════════════════════════════════════════════════════════════════════
const getProspectosWithDataFilter = async (req, res) => {
    try {
        const {
            desde,
            hasta,
            fuenteId,
            venta,
            asesorAsignado,
            valorCotizadoMin,
            valorCotizadoMax,
        } = req.query;

        // ── 1. WHERE del prospecto ────────────────────────────────────
        const whereProspecto = {};

        // Rango de fechas → todos los estados. Sin rango → solo activos
        if (desde || hasta) {
            const rangoFecha = {};
            if (desde) rangoFecha[Op.gte] = new Date(desde);
            if (hasta) rangoFecha[Op.lte] = new Date(hasta);
            whereProspecto.createdAt = rangoFecha;
        } else {
            whereProspecto.state = { [Op.in]: ['intento 1', 'intento 2', 'intento 3'] };
        }

        // Filtro por fuente
        if (fuenteId) whereProspecto.fuenteId = Number(fuenteId);


        // ── 2. WHERE del dataProspect ─────────────────────────────────
        const whereData  = {};
        const andLiteral = []; // Para condiciones con CAST (valorCotizado)
        let   requiredData = false; // false = LEFT JOIN, true = INNER JOIN

        // Filtro por venta (boolean)
        if (venta !== undefined && venta !== '') {
            whereData.venta = venta === 'true';
            requiredData = true;
        }

        // Filtro por asesor asignado
        if (asesorAsignado) {
            whereData.asesorAsignado = Number(asesorAsignado);
            requiredData = true;
        }

        // Filtro por rango de valorCotizado
        // valorCotizado es STRING en BD → hacemos CAST a NUMERIC en PostgreSQL.
        // parseFloat() sanitiza el input: solo deja pasar números.
        if (valorCotizadoMin && !isNaN(parseFloat(valorCotizadoMin))) {
            andLiteral.push(
                Sequelize.where(
                    Sequelize.cast(Sequelize.col('dataProspect.valorCotizado'), 'NUMERIC'),
                    { [Op.gte]: parseFloat(valorCotizadoMin) }
                )
            );
            requiredData = true;
        }
        if (valorCotizadoMax && !isNaN(parseFloat(valorCotizadoMax))) {
            andLiteral.push(
                Sequelize.where(
                    Sequelize.cast(Sequelize.col('dataProspect.valorCotizado'), 'NUMERIC'),
                    { [Op.lte]: parseFloat(valorCotizadoMax) }
                )
            );
            requiredData = true;
        }

        // Unimos condiciones del dataProspect
        if (andLiteral.length) whereData[Op.and] = andLiteral;

        const dataProspectInclude = {
            model:    dataProspect,
            required: requiredData,
            ...(Object.keys(whereData).length && { where: whereData }),
        };


        // ── 3. QUERY ──────────────────────────────────────────────────
        const results = await prospecto.findAll({
            where: whereProspecto,
            include: [
                dataProspectInclude,
                { model: calendary },
                { model: register  },
                { model: fuente    },
            ],
            order: [['createdAt', 'DESC']],
        }).catch(err => {
            console.error('[getProspectosWithDataFilter]', err);
            return null;
        });

        if (!results) {
            return res.status(500).json({ msg: 'Error al consultar prospectos.' });
        }
        if (!results.length) {
            return res.status(404).json({ msg: 'No se encontraron prospectos con esos filtros.' });
        }

        return res.status(200).json(results);

    } catch (err) {
        console.error('[getProspectosWithDataFilter]', err);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


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
    getFuente,               // Obtener fuente por nombre
    newProspectExternal,     // Nuevo prospecto externo
    getProspectosWithDataFilter, // Prospectos + dataProspect con filtros
}