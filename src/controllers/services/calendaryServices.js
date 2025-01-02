const { cliente, register, calendary } = require('./../../db/db');

// Funcion para señalar que se cumplio con la fecha.
const cumplido = async (calendaryId, state) => {
    try{
        // Validamos los datos necesarios.
        if(!calendaryId) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const updateCalendary = await calendary.update({
            state: 'cumplido',
            extra: state,
        }, {
            where: {
                id: calendaryId
            }
        }).catch(err => {
            console.log(err);
            return null;
        })
        if(!updateCalendary) return false;

        // Retorne true si actualizo
        return true

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// Funcion para señalar que se aplazo la fecha.
const aplazado = async (calendaryId) => {
    try{
        // Validamos los datos necesarios.
        if(!calendaryId) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const updateCalendary = await calendary.update({
            state: 'aplazado',
        }, {
            where: {
                id: calendaryId
            }
        }).catch(err => {
            console.log(err);
            return null;
        })
        if(!updateCalendary) return false;

        // Retorne true si actualizo
        return true

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// Funcion para señalar que cancelar la fecha.
const cancelar = async (calendaryId) => {
    try{
        // Validamos los datos necesarios.
        if(!calendaryId) return res.status(501).json({msg:'Parametros invalidos.'});
        // Caso contrario, avanzamos...
        
        const updateCalendary = await calendary.update({
            state: 'cancelado',
        }, {
            where: {
                id: calendaryId
            }
        }).catch(err => {
            console.log(err);
            return null;
        })
        if(!updateCalendary) return false;

        // Retorne true si actualizo
        return true

    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
} 
module.exports = {
    cumplido,
    aplazado,
    cancelar
}