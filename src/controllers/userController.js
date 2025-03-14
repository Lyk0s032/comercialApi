const express = require('express');
const { client, user, contact, cotizacion, call, visita, meta, calendary } = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const rounds = process.env.AUTH_ROUNDS || 10;
const secrete = process.env.AUTH_SECRET || 'WithGod';
const expires = process.env.AUTH_EXPIRES || "30d";
const authConfig = require('../../config/auth'); 
const dayjs = require('dayjs');
// CONTROLADORES DEL CLIENTE


// AUTENTICAR EL TOKEN
const isAuthenticated = async (req,res, next)=>{
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    if(!token){
        console.log('logueate, por favor');
        return next('Please login to access the data');
    }
    try {
        const verify = jwt.verify(token,authConfig.secret);
        req.user = verify;
        console.log('Lo hace con éxito') 
        next();
    } catch (error) {
        console.log('intenta pero falla');
        return next(error);  
    }
}
const signIn = async(req, res) => {
    try{
        // Recibimos datos por body
        const { phone, password} = req.body;
    
        const usuario = await user.findOne({
            where: {
                phone:phone
            },

        }).catch(err => {
            console.log(err);
            return null;
        });
        if(!usuario) {
            console.log('No hemos encontrado este usuario.');
            return res.status(404).json({msg: 'Usuario no encontrado'});
        }
    
        if(bcrypt.compareSync(password, usuario.password)){
            let token = jwt.sign({user: usuario}, authConfig.secret, {
                expiresIn: authConfig.expires
            });
            res.status(200).header('auth_token').json({
                error: null,
                data: token
            })
        }else{
            // No autoriza el acceso.
            console.log('error aca');
            res.status(401).json({msg: 'La contraseña no es valida.'});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
const getDataUserByMonth = async(req, res) => {
    try{
        // Obtener datos por params
        const { ano, month, userId } = req.params;
    
        const inicioMes = dayjs(`${ano}-${month}-06` ) // Primer día del mes en UTC
        const finMes = dayjs(`${ano}-${Number(month)+Number(1)}-05` ) // Último día del mes en UTC


        if(!ano || !month || !userId) return res.status(501).json({msg: 'parametros invalidos'});
        // Caso contrario, avanzamos

        const searchUser = await user.findByPk(userId, {
            include: [{
                model: call,
                where: {
                    state: 'cumplida',
                    updatedAt: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()]
                    }
                },
                include:[{
                    model: client,
                }],
                required:false
            }, {
                model: visita,
                where: {
                    state: 'cumplida',
                    updatedAt: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()]
                    }
                },
                include:[{
                    model: client,
                }],
                required:false
            }, {
                model: cotizacion,
                where: {
                    state:{
                        [Op.or]: ['aplazado', 'perdido']
                    },
                    fechaAprobada: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()]
                    }
                },
                required:false,
                include:[{
                    model: client,
                }],
            }, {
                model: meta,
                where: {
                    fecha: {
                        [Op.between]: [inicioMes.toDate(), finMes.toDate()]
                    }
                },
                required:false
            }]
        }).catch(err => {
            console.log(err);
            return null;
        })

        if(!searchUser) return res.status(404).json({msg: 'Sin resultados'});
        // Contrario
        
        let total = searchUser &&  searchUser.cotizacions && searchUser.cotizacions.length ? 
            searchUser.cotizacions.reduce((acumulador, valorActual) => acumulador + (Number(valorActual.bruto) - Number(valorActual.descuento)), 0) 
            : 0; 
        let result = {
            searchUser,
            total: total
        }
        res.status(200).json(result);

    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
    }
}
const addMetas = async(req, res) => {
    try{
        const { userId, visitas, llamadas, cotizaciones, valor, fecha } = req.body;
        
        // Validamos
        if(!userId || !fecha) return res.status(501).json({msg: 'Paramrtros invalidos.'});
        // Caso contrario, buscamos si ya existe.

        const inicio = dayjs(fecha).date(6);
        const fin = dayjs(fecha).add(1, 'month').date(5);

        const searchMeta = await meta.findOne({
            where: {
                userId,
                fecha: {
                    [Op.between]: [inicio.toDate(), fin.toDate()]
                }
            }
        }).catch(err => {
            console.log(err);
            return null
        });
        // Validamos
        if(searchMeta) return res.status(200).json({msg: 'Ya existe una meta.'})
        // Caso contraro, la creamos

        const addMeta = await meta.create({
            visitas: visitas,
            llamadas,
            cotizaciones,
            valor,
            fecha,
            userId
        }).catch(err => {
            console.log(err);
            return null
        });
        if(!addMeta) return res.status(400).json({msg: 'No hemos logrado crear esto.'});
        // Caso contrario, enviamos respuesta
        res.status(201).json(addMeta)
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal'});
    }
}
const getAllAsesores = async(req, res) => {
    try{
        // Obtenemos id del usuario por params
        const { userId } = req.params;
        // Validamos que entre
        if(!userId) return res.status(501).json({msg: 'Parametro invalido.'});
        // Caso contrario, buscamo el usuario
        const searchUser = await user.findByPk(userId).catch(err => null)
        if(!searchUser) return res.status(404).json({msg: 'No hemos encontrado esto.'});
        // Caso contrario, avanzamos
        if(searchUser.rango == 'lider' || searchUser.rango == 'comercial'){
            const searchAllAsesores = await user.findAll({
                where: {
                    rango: 'asesor' 
                }
            }).catch(err => {
                console.log(err);
                return null;
            });
            if(!searchAllAsesores || !searchAllAsesores.length) return res.status(404).json({msg: 'No hay resultados'}) 
            return res.status(200).json(searchAllAsesores);
        }else if(searchUser.rango == 'asesor'){
            const searchAllAsesores = await user.findAll({
                where: {
                    id: userId 
                }
            }).catch(err => {
                console.log(err);
                return null;
            });
            if(!searchAllAsesores) return res.status(404).json({msg: 'No hay resultados'}) 
            return res.status(200).json(searchAllAsesores);
        }
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
const getAllUserById = async(req, res) => {
    try{
        // Obtengo el dato por params;
        const { asesorId } = req.params;

        if(!asesorId) return res.status(501).json({msg: 'Los parametros no son validos'})
         
        // Caso contrario, avanzamos.
        const searchAsesor = await user.findByPk(asesorId, {
            include: [
                { 
                    model: cotizacion,
                    where: {
                        state:{
                            [Op.or]: ['pendiente', 'aplazado', 'desarrollo']
                        }
                    },
                    include:[{
                        model: client
                    }],
                    required: false
                },
                { 
                    model: call,
                    where: {
                        state: {
                            [Op.or]: ['active', 'aplazado', 'aplazada']
                        }
                    },
                    required:false,
                    include:[{
                        model: client
                    }]
                },
                {
                    model: visita,
                    where: {
                        state: {
                            [Op.or]: ['active', 'aplazado', 'aplazada']
                        }
                    },
                    include:[{
                        model: client
                    }],
                    required:false
                }
            ]
        }).catch(err => {
            console.log(err);
            return null
        });

        if(!searchAsesor) return res.status(404).json({msg: 'No hemos encontrado esto.'});
        // caso contrario, avanzamos
        res.status(200).json(searchAsesor);
    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'});
    }
}
const getUserById = async (req, res) => {
    try{
        // Recibimos por params
        const { id } = req.params;

        // Consultamos todo.
        const searchUser = await user.findByPk(id).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchUser || !searchUser.length) return res.status(404).json({msg:'No hemos encontrado este usuario.'});
        // Caso contrario, enviamos resultados.
        res.status(200).json(searchUser)
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
// CREAR USUARIO
const createUser = async (req, res) => {
    try{
        // Recibo toda la informacion por body
        const { name, lastName, nick, phone, email, password, photo, age, rango} = req.body; 
        // Validamos que entren los datos necesarios
        if(!name ) return res.status(501).json({msg: 'Parametros no validos.'});
        
        const passwordy = String(password); // Pasamos la contraseña a STRING
        let pass = bcrypt.hashSync(passwordy, Number.parseInt(rounds)); // Finalizamos Hasheo

        // Validamos que no exista un correo igual
        const searchEmail = await user.findOne({ 
            where: {
                email,
            }
        }).catch(err => null);

        if(searchEmail) return res.status(502).json({msg: 'Ya existe una cuenta con este email o teléfono'});

        const searchPhone = await user.findOne({
            where: {
                phone,
            }
        }).catch(err => null);
        if(searchPhone) return res.status(502).json({msg: 'Ya existe una cuenta con este email o teléfono'});



        // caso contrario, creamos el cliente.
        const createUsuario = await user.create({
            name,
            lastName,
            nick,
            phone,
            email,
            password: pass,
            photo,
            age,
            rango,
            state: 'active'
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!createUsuario) return res.status(502).json({msg: 'No hemos podido crear este cliente.'});
        // Caso contrario, enviamos respuesta.
        res.status(201).json(createUsuario);

    }catch(err ){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// CREAMOS FUNCION PARA OBTENER TODOS LOS REGISTROS GENERALES DENTRO DEL EMBUDO
const systemFunctionEmbudo = async (req, res) => {
    try{
        // Recibimos datos por body
        const { range } = req.body;
        // Valiamos que los parametros sean los correctos.
        if(!range) return res.status(500).json({msg: 'Parametros no son validos.'});

        // Caso contrario, avanzamos..
        

        // Entregamos resultado.
        res.status(200).json({msg: 'Resultado'})

    }catch(err){
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la princiapal.'})
    }
}

module.exports = {
    getUserById,
    createUser,
    getAllUserById, // Obtener la información del asesor por params ID
    getAllAsesores, // Obtener lista de asesores
    addMetas,
    getDataUserByMonth,
    signIn, // Iniciar sesión
    isAuthenticated,
}