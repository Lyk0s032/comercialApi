const dayjs = require('dayjs');
const { tag, fuente, prospecto, cliente, register, calendary, cotizacion } = require('./../../db/db');

// Funciones para agregar FUENTES, TAGS Y PROSPECTOS.

const removeTag = async (id) => {
    try{
        // Validamos que el parametro entre correctamente
        if(!id) return 501
        // Caso contrario, avanzamos
        const deleteTag = await tag.destroy({
            where: {
                id
            }
        }).catch(err => {
            console.log(err);
            return null
        });

        // Validamos
        if(!deleteTag) return 502
        // Caso contrario
        return 200
    }catch(err){
        console.log(err);
        return 500
    }
}
const getAllTags = async() => {
    try{
        const searchTags = await tag.findAll({
            where: {
                state: 'active'
            }
        }).catch(err => {
            console.log(err);
            return null
        });

        if(!searchTags) return 404
        return searchTags
    }catch(err){
        console.log(err);
        return 500
    }
}

const updateFuente = async (id ) => {
    try{
        if(!id) return 501

        // Caso contrario, avanzamos...

        const updateFuente = await fuente.update({
            state: 'inactive'
        }, {
            where:{
                id: id
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!updateFuente){
            return 502
        }else{
            return 200
        }
    }catch(err){
        console.log(err);
        return 500
    }
}
const addTag = async(name, type) => {
    try{
        if(!name || !type) return 501
        // Avanzamos
        const createTags = await tag.create({
            nombre: name,
            type,
            state: 'active'
        }).catch(err => {
            console.log(err);
            return null
        });

        if(!createTags) return 502
        return createTags;
    }catch(err){
        console.log(err);
        return 501
    }
}
const getFuentes = async () => {
    try{
        const searchAllFuentes = await fuente.findAll({
            where: {
                state: 'active'
            }
        }).catch(err => {
            console.log(err);
            return null;
        });

        if(!searchAllFuentes) return 502
        return searchAllFuentes
    }catch(err){
        console.log(err);
        return 500;
    }
}
const newFuente = async (name, type) => {
    try{
        // Validamos los datos necesarios.
        const msg = "Parametros invalidos";
        if(!name || !type) return JSON.parse(msg);
        // Caso contrario, avanzamos...
        
        const newFuente = await fuente.create({
            nombre: name,
            urlForm: null,
            type,
            imgQR: null,
            state: 'active' 
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!newFuente) return 502;
        // Caso contrario, enviamos el registro
        return newFuente
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

const newProspecto = async(nombreEmpresa, namePersona,
    phone, email, type, cargo, url, direccion, city, fijo, fuenteId, mensaje
) => {
    try {
        if(!namePersona || !phone) return 501
        // Caso contrario, creamos

        const newProspecto = await prospecto.create({
            nombreEmpresa,
            namePersona,
            phone,
            email,
            type, 
            cargo,
            url,
            direccion,
            city,
            fijo,
            fuenteId,
            mensaje,
            state: 'intento 1'
        }).catch(err => {
            console.log(err);
            return null;
        }); 

        if(!newProspecto){
            return 502
        }else{
            return newProspecto
        }
    }catch(err){
        console.log(err);
        return 500
    }
}

module.exports = {
    removeTag,
    getAllTags,
    addTag,
    getFuentes,
    newFuente,
    updateFuente,
    newProspecto
}