const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('calendary', { 
        // Estado de la actividad : 'Active', 'Cumplido', 'Aplazado', 'Cancelado'
        state: {
            type: DataTypes.STRING
        },
        contacto: { // Contacto 1, contacto 2, o contacto 3.
            type: DataTypes.STRING,
        },
        prospectos: { // Contacto 1, contacto 2, o contacto 3.
            type: DataTypes.STRING,
        },
        // Tipo de alerta: // Intento, Llamada, Visita, Cotizacion
        type:{
            type: DataTypes.STRING
        }, 
        case: { // Contacto 1, 2 ,3  Intento 1, 2, 3
            type: DataTypes.STRING
        },
        // nota
        note: {
            type: DataTypes.TEXT
        },
        time:{
            type: DataTypes.DATE
        },
        hour: {
            type: DataTypes.STRING
        },
        // extra // Indica si fue en perdido o espera.
        extra: {
            type: DataTypes.STRING
        },
        


    })
}