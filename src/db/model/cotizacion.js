const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('cotizacion', { 
        // Nombre de cotizacion
        name: {
            type: DataTypes.STRING
        },
        // NIT
        nit: {
            type: DataTypes.STRING
        },
        // Nro
        nro: {
            type: DataTypes.STRING
        },
        // Fecha
        fecha:{ // Fecha en que fue creada.
            type: DataTypes.DATE
        }, 
        fechaAprobada:{ // Fecha que asigna el sistema de creada.
            type: DataTypes.DATE
        },
        // Bruto
        bruto: { 
            type: DataTypes.STRING
        },
        // Descuento
        descuento: { 
            type: DataTypes.INTEGER
        },
        // IVA
        iva: {
            type: DataTypes.INTEGER, 
            defaultValue: 19
        },
        // Neto
        neto: {
            type: DataTypes.STRING
        },
        state: { // Activa, Aprobada, Perdida, Aplazada, desarrollando.
            type: DataTypes.STRING
        } 
    })
}