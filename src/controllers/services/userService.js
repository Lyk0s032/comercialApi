const dayjs = require('dayjs');
const { tag, user, fuente, prospecto, cliente, register, calendary, cotizacion } = require('./../../db/db');

// Funciones para agregar FUENTES, TAGS Y PROSPECTOS.

const searchUserServices = async (id) => {
    try{
        // Validamos que el parametro entre correctamente
        if(!id) return 501
        // Caso contrario, avanzamos
        const searchById = user.findByPk(id).catch(err => {
            console.log(err);
            return null
        });

        // Validamos
        if(!searchById) return 404
        // Caso contrario
        return searchById
    }catch(err){
        console.log(err);
        return 500
    }
}

module.exports = {
    searchUserServices,
}