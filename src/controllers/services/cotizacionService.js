const dayjs = require('dayjs');
const { cliente, register, calendary, cotizacion } = require('./../../db/db');

// Funcion para agregar Cotizacion.
const addCotizacion = async (name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId) => {
    try{
        // Validamos los datos necesarios.
        const msg = "Parametros invalidos";
        if(!name || !nit || !userId || !nro || !fecha || !bruto || !descuento || !neto || !clientId) return JSON.parse(msg);
        // Caso contrario, avanzamos...
        
        const addCotizacion = await cotizacion.create({
            name,
            nit,
            nro,
            fecha,
            fechaAprobada: null,
            bruto,
            descuento,
            iva,
            neto,
            clientId,
            userId,
            state: 'pendiente'
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!addCotizacion) return 502;
        // Caso contrario, enviamos el registro
        return addCotizacion
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}

// Funcion para editar Cotizacion por ID.
const editCotizacion = async (name, nit, nro, fecha, bruto, descuento, iva, neto, userId, clientId, cotizacionId, state) => {
    try{

        const coti = await cotizacion.findByPk(cotizacionId).catch(err => {
            console.log(err);
            return null;
        })

        if(!coti) return 404;

        // Caso contrario, avanzamos...
        const addCotizacion = await cotizacion.update({
            name: name ? name : coti.name,
            nit: nit ? nit : coti.nit,
            nro: nro ? nro : coti.nro,
            bruto: bruto ? bruto : coti.bruto,
            descuento: descuento ? descuento : coti.descuento,
            iva: iva ? iva : coti.iva,
            neto: neto ? neto : coti.neto,
            state
        }, {
            where: {
                id: cotizacionId
            }
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!addCotizacion) return 502;
        // Caso contrario, enviamos el registro
        return addCotizacion
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


// Actualizar estado.
const updateState = async (cotizacionId, state) => {
    try{
        const fechaOk = dayjs();
        // Caso contrario, avanzamos...
        const addCotizacion = await cotizacion.update({
            state,
            fechaAprobada: fechaOk
        }, {
            where: {
                id: cotizacionId
            }
        }).catch(err =>{
            console.log(err);
            return null;
        });

        if(!addCotizacion) return 502;
        // Caso contrario, enviamos el registro
        return addCotizacion
        
    }catch(err) {
        console.log(err);
        res.status(500).json({msg: 'Ha ocurrido un error en la principal.'})
    }
}


module.exports = {
    updateState,
    addCotizacion,
    editCotizacion
}