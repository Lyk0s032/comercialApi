const { cliente, register, calendary } = require('./../../db/db');

// Funcion para agregar nota.
const addNoteServices = async (type, contacto, prospecto, tags, note, extra, manual, userId, clientId, callId, visitaId, prospectoId, calendaryId, cotizacionId) => {
    try{
        // Validamos los datos necesarios.
        const msg = "Parametros invalidos";
        if(!note || !type || !userId ) return JSON.parse(msg);
        // Caso contrario, avanzamos...
        
        const addNote = await register.create({
            type: type,
            prospecto, // aplica si es en prospecto
            contacto, // Aplica si en contacto
            tags,
            note,
            extra, // Aplica si esta en espera o en perdido.
            callId,
            clientId,
            manual,
            userId,
            calendaryId,
            visitumId: visitaId,
            prospectoId,
            cotizacionId: cotizacionId ? cotizacionId : null
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!addNote) return 404;
        // Caso contrario, enviamos el registro
        return addNote
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}
module.exports = {
    addNoteServices
}