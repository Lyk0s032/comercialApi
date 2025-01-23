const { default: axios } = require('axios');
const { cliente, register, calendary, visita } = require('./../../db/db');

// CREAR VISITA
const createVisitaServices = async (title, clientId, userId, time, hour ) => {
    try{
        // Recibo toda la informacion por body
        // Validamos que entren los datos necesarios
        if(!title || !clientId || !userId || !hour) res.status(501).json({msg: 'Parametros no validos.'});

        // caso contrario, creamos el cliente.
        const createCliente = await visita.create({
            title,
            clientId,
            userId,
            state: 'active'  
        })
        .then(async (result) => {
            // CREAMOS EL BODY PARA AGREGAR EVENTO AL CALENDARIO
            let body = {
                userId,
                clientId,
                visitaId: result.id,
                type: 'visita',
                caso: null,
                contacto: null,
                note: title,
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

            return result
        })
        .catch(err => {
            console.log(err);
            return null;
        });

        if(!createCliente) return false;
        // Caso contrario, enviamos respuesta.
        return 201

    }catch(err ){
        console.log(err);
        return 500
    }
}

module.exports = {
    createVisitaServices
}