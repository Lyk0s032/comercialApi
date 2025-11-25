const express = require('express');
const { client, contact, cotizacion, user, register, } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op, Sequelize } = require('sequelize');
const dayjs = require('dayjs'); // Importamos dayjs
const utc = require('dayjs/plugin/utc'); // Importamos el plugin UTC
dayjs.extend(utc); // Extendemos dayjs con el plugin utc
// CONTROLADORES DEL CLIENTE

// DASHBOARD CLIENT
// Buscar aprobadas y perdidas en un mes
const searchAprobadasByMonth = async(req, res) => {
    try{
        // Obtenemos la fecha
        const { ano, month, clientId } = req.params;

        const inicioMes = dayjs(`${ano}-${month}-06` ) // Primer día del mes en UTC
        const finMes = dayjs(`${ano}-${Number(month)+Number(1)}-05` ) // Último día del mes en UTC


        let data = {}

        const searchAprobadas = await cotizacion.findAll({
            where: {
                state: 'aprobada',
                fechaAprobada: {
                    [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                },
                clientId: clientId,
                
            },
            include:[{
                model: user
            }, {model:client}],
            required:false
        }).catch(err => {
            console.log(err);
            return null;
        });

        // Buscamos las perdidas
        const searchPerdidas = await cotizacion.findAll({
            where: {
                state: 'perdido',
                fechaAprobada: {
                    [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                },
                clientId: clientId,

            },
            include:[{
                model: user
            }, {model:client}],
            required: false

            
        }).catch(err => {
            console.log(err);
            return null;
        });
        let sumarAprobadas = !searchAprobadas ? null : searchAprobadas.reduce((acumulador, valorActual) => acumulador + (Number(valorActual.bruto) - Number(valorActual.descuento)), 0);
        let aprobadas = {
            cotizaciones: searchAprobadas,
            total: sumarAprobadas
        }
        let sumarPerdidas = !searchPerdidas ? null :searchPerdidas.reduce((acumulador, valorActual) => acumulador + (Number(valorActual.bruto) - Number(valorActual.descuento)), 0);
        let perdidas = {
            cotizaciones: searchPerdidas,
            total: sumarPerdidas
        }
        let resultado = {aprobadas, perdidas}
        res.status(200).json(resultado)
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}

// Buscar cliente por ID
const searchClientById = async(req, res) => {
    try{
        // Recibimos ID por body
        const { clientId } = req.params;

        // Validamos que entre correctamente
        if(!clientId) return res.status(501).json({msg: 'Parametro invalido.'});
        // Caso contrario, avanzamos...
        const searchClient = await  client.findByPk(clientId, {
            include:[{
                model: contact
            }, {model: cotizacion, 
                where: {
                    state: {
                        [Op.or]: ['pendiente', 'aplazado', 'desarrollo']
                    }
                },
                include: [{
                    model: user
                }, {model: client}],
                required:false
            }]
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchClient) return res.status(404).json({msg: 'No hemos encontrado esto.'});
        // Caso contrario, enviamos respuesta.
        res.status(200).json(searchClient);

    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
// Buscar cotizaciones por mes
const searchCotiByYear = async(req, res) => {
    try{
        const { clientId } = req.params;
        const result = await cotizacion.findAll({
            where: {
                state: 'aprobada', 
                clientId: clientId
            },
            attributes: [
                [Sequelize.fn('date_trunc', 'month', Sequelize.col('fecha')), 'month'],
        
                // Contar las cotizaciones por mes
                [Sequelize.fn('count', Sequelize.col('id')), 'cotizacion_count'],
                
                // Agregar detalles de las cotizaciones en arrays
                [Sequelize.fn('array_agg', Sequelize.col('id')), 'cotizaciones_ids'],
                [Sequelize.fn('array_agg', Sequelize.col('bruto')), 'cotizaciones_brutos'],
                [Sequelize.fn('array_agg', Sequelize.col('descuento')), 'cotizaciones_descuentos'],
                
                // Calcular el total (bruto - descuento)
                [Sequelize.fn('array_agg', Sequelize.literal('CAST("bruto" AS DECIMAL) - CAST("descuento" AS DECIMAL)')), 'cotizaciones_totales'],
                [Sequelize.fn('array_agg', Sequelize.col('fecha')), 'cotizaciones_fechas'],

            ],
            group: [
                Sequelize.fn('date_trunc', 'month', Sequelize.col('fecha')), // Agrupar por mes
              ],
              order: [
                [Sequelize.fn('date_trunc', 'month', Sequelize.col('fecha')), 'ASC'], // Ordenar por mes ascendente
              ],
          });

        const currently = dayjs();
        const currentlyMonth = currently.format('MM');
        let month = [currentlyMonth]
        for (let i = 1; i <=11; i++) {
            // Agregamos el valor de "i" multiplicado por 2 al array
            const last = month[month.length - 1 ];
            const mes = dayjs(last).subtract(1, 'month');
            const format = mes.format('MM'); 
            month.push(format);
        } 
        
        return res.status(200).json({
            meses: month,
            resultados: result
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// DASHBOARD CLIENTES 

// MOSTRAR LO VENDIDO EN UN MES
const searchAllMoneyByMonth = async(req, res) => {
    try{
        const { ano, month } = req.params;

        const inicioMes = dayjs(`${ano}-${month}-06` ) // Primer día del mes en UTC
        const finMes = dayjs(`${ano}-${Number(month)+Number(1)}-05` ) // Último día del mes en UTC


        let data = {}
        const searchAllCotizacions = await cotizacion.findAll({
            where: {
                state: 'aprobada',
                fechaAprobada: {
                    [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                },
            }
        }).catch(err => {
            console.log(err);
            return null;
        });
        const searchAllPerdidas = await cotizacion.findAll({
            where: {
                state: 'perdido',
                fechaAprobada: {
                    [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                },
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        const searchAllCotizacionsCreadas = await cotizacion.findAll({
            where: {
                fecha: {
                    [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                },
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        data = {
            aprobadas: searchAllCotizacions,
            perdidas: searchAllPerdidas,
            creadas: searchAllCotizacionsCreadas
        }
        console.log(data.cotizaciones) 
        res.status(200).json(data)
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
    }
}
// Mostrar cotizaciones por mes y por día
const searchForGraphDay = async(req, res) => {
    try{
        const {ano, month, type} = req.params;  

        const inicioMes = dayjs(`${ano}-${month}-06` ) // Primer día del mes en UTC
        const finMes = dayjs(`${ano}-${Number(month)+Number(1)}-05` ) // Último día del mes en UTC
        // Verificamos las fechas generadas
      
        console.log(inicioMes)
        console.log(ano)

        let data = {

        }
        if(type == 'all'){
            const cotizacionesPorDia = await cotizacion.findAll({
                attributes: [
                    [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'dia'],                
                    [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_cotizaciones'], // Contar las cotizaciones por día
                ],
                where: { 
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                    },
                    state: 'aprobada'
                },

                group: [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")") ], // Agrupamos por día
                order: [[Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'ASC']], // Ordenamos por día
            }).catch(err => {
                console.log(err);
                return null;
            })
            // Perdidas
            const cotizacionesPerdidas = await cotizacion.findAll({
                attributes: [
                    [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'dia'],                
                    [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_cotizaciones'], // Contar las cotizaciones por día
                ],
                where: { 
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                    },
                    state: 'perdido'
                },

                group: [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")") ], // Agrupamos por día
                order: [[Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'ASC']], // Ordenamos por día
            }).catch(err => {
                console.log(err);
                return null;
            });
            // CREADAS
            const cotizacionesCreadas = await cotizacion.findAll({
                attributes: [
                    [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fecha\")"), 'dia'],                
                    [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_cotizaciones'], // Contar las cotizaciones por día
                ],
                where: { 
                    fecha: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                    },
                    state: 'pendiente'
                },

                group: [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fecha\")") ], // Agrupamos por día
                order: [[Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fecha\")"), 'ASC']], // Ordenamos por día
            }).catch(err => {
                console.log(err);
                return null;
            })

            data = { 
                aprobadas: cotizacionesPorDia.length ? cotizacionesPorDia : null,
                perdidas: cotizacionesPerdidas.length ? cotizacionesPerdidas : null,
                creadas: cotizacionesCreadas.length ? cotizacionesCreadas : null

            }

            // caso contrario, enviamos respuesta
            return res.status(200).json(data)
        }else{
            
            const cotizacionesPorDia = await cotizacion.findAll({
                attributes: [
                    [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'dia'],                
                    [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_cotizaciones'], // Contar las cotizaciones por día
                ],
                where: { 
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                    },
                },
                include:[{
                    model: client,
                    where: {
                        type
                    }
                }],
                require: false,
                group: [Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'client.id' ], // Agrupamos por día
                order: [[Sequelize.literal("DATE_TRUNC('day', cotizacion.\"fechaAprobada\")"), 'ASC']], // Ordenamos por día
            }).catch(err => {
                console.log(err);
                return null;
            })

            if(!cotizacionesPorDia || !cotizacionesPorDia.length) return res.status(404).json({msg: 'No hemos encontrado esto.'});

            // caso contrario, enviamos respuesta
            return res.status(200).json(cotizacionesPorDia)
        }
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ocurrio error en la principal'});
    }
}

// COTIZACIONES
const searchCotizacionsByMonth = async(req, res) => {
    try {
        const result = await cotizacion.findAll({
          attributes: [
            'state', // Agrupar por tipo
            [Sequelize.fn('COUNT', Sequelize.col('state')), 'count'] // Contar la cantidad de cotizacion por state
          ],
          group: ['state'] // Agrupar por el campo 'state'
        }).catch(err => {
            console.log(err);
            return null;
        });
    
        if(!result) return res.status(404).json({msg: 'No hemos encontrado resultados'});
        // Mostrar resultados
        result.forEach(r => {
          console.log(`Tipo: ${r.type}, Cantidad: ${r.count}`);
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}

// MOSTRAR CLIENTES CON MÁS COTIZACIONES APROBADAS
const searchClientWithMoreAprobadas = async(req, res) => {
    try {
        const { ano, month} = req.params;

        const inicioMes = dayjs(`${ano}-${month}-06`);
        const finMes = dayjs(`${ano}-${Number(month)+1}-05`);

        const SearchClientes = await client.findAll({
            attributes: [
                'id',
                'nombreEmpresa',
                'type',
                'photo',
                [
                    Sequelize.literal(
                      `(SELECT COUNT(*) 
                        FROM "cotizacions" 
                        WHERE "cotizacions"."clientId" = "client"."id" 
                        AND "cotizacions"."state" = 'aprobada' 
                        AND "cotizacions"."fechaAprobada" BETWEEN '${inicioMes.format('YYYY-MM-DD')}' AND '${finMes.format('YYYY-MM-DD')}')`
                    ), 
                    'numeroCotizacionesAprobadas',
                ]
            ],
            include:[{
                model: cotizacion,
                where: {
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()],
                    }
                }
            }],
            order: [
                [
                    Sequelize.literal(
                      `(SELECT COUNT(*) 
                        FROM "cotizacions" 
                        WHERE "cotizacions"."clientId" = "client"."id" 
                        AND "cotizacions"."state" = 'aprobada'
                        AND "cotizacions"."fechaAprobada" BETWEEN '${inicioMes.format('YYYY-MM-DD')}' AND '${finMes.format('YYYY-MM-DD')}')`
                    ),
                    'DESC'
                ]
            ],
            limit: 20,
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!SearchClientes || !SearchClientes.length) 
            return res.status(404).json({msg: 'No hemos encontrado resultados.'});

        res.status(200).json(SearchClientes);

    } catch (error) {
        console.error('Error al obtener los clientes:', error);
    }
}

// MOSTRAR POR TYPE
const searchCountForType = async(req, res) => {
    try {
        const result = await client.findAll({
          attributes: [
            'type', // Agrupar por tipo
            [Sequelize.fn('COUNT', Sequelize.col('type')), 'count'] // Contar la cantidad de clientes por tipo
          ], 
          group: ['type'] // Agrupar por el campo 'type'
        }).catch(err => {
            console.log(err);
            return null;
        });
    
        if(!result) return res.status(404).json({msg: 'No hemos encontrado resultados'});
        // Mostrar resultados
        result.forEach(r => {
          console.log(`Tipo: ${r.type}, Cantidad: ${r.count}`);
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}

// CLIENTES
//  BUSCADOR DE CLIENTES POR NOMBRE
const searchClient = async (req, res) => {
    try{
        // Recibimos datos por query
        const { query } = req.query;
        
        // Arrancamos la consulta
        if (!query) {
            return res.status(400).json({ message: 'Debes ingresar un término de búsqueda' });
        }
        const searchCl = await client.findAll({
            where: {
                nombreEmpresa: {
                   [Op.iLike]: `%${query}%`
                }
            },
            include: [{
                model: contact
            }]
        }).catch(err => {
            console.log(err);
            return null
        })
        console.log(searchCl)
        console.log('Entra')
        if(!searchCl || !searchCl.length) return res.status(404).json({msg:'No hay resultados'})        
        // Caso contrario, enviamos la respuesta
        res.status(200).json(searchCl);

    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
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
        const { photo, nombreEmpresa, nit, phone, email, type, sector, responsable, url, direccion, fijo, ciudad } = req.body; 
        // Validamos que entren los datos necesarios
        if(!nombreEmpresa || !phone || !type) res.status(501).json({msg: 'Parametros no validos.'});

        let defaultPerson = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
        let defaultDistribuidor = 'https://professorm.org/wp-content/uploads/google-my-business-logo-500.png';
        let businessDefault = 'https://cdn-icons-png.flaticon.com/512/10839/10839543.png';

        let wallpaper = photo ? photo : type == 'persona' ? defaultPerson : type == 'distribuidor' ? defaultDistribuidor : businessDefault
        // caso contrario, creamos el cliente.
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
        const { photo, clientId, nombreEmpresa, nit, phone, email, type, sector, responsable, url, direccion, fijo, ciudad } = req.body; 
        // Validamos que entren los datos necesarios
        if(!clientId) return  res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const updateClient = await client.update({
            photo,
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
    searchClient, // BUSCAMOR A TIEMPO REAL
    getAllClients,
    createClient,
    updateCliente,
    // CLIENTES
    searchCountForType,
    searchClientWithMoreAprobadas,
    searchCotizacionsByMonth,
    searchForGraphDay, // OBTENER POR DIAS
    searchAllMoneyByMonth,
    // GET ID
    searchClientById,
    searchCotiByYear, // POR AÑo
    searchAprobadasByMonth, // Buscar por mes cotizaciones y valor - 
} 