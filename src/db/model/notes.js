const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('register', { 
        // Intento 1 || Contactos || Visita || Cotizacion
        type: {
            type: DataTypes.STRING
        },
        contacto: {
            type: DataTypes.STRING
        },
        prospect: {
            type: DataTypes.STRING
        },
        // tags
        tags:{
            type: DataTypes.ARRAY(DataTypes.STRING)
        },
        // nota
        note: {
            type: DataTypes.TEXT
        },
        // extra // Indica si fue perdido o espera.
        extra: {
            type: DataTypes.STRING
        },
        manual: { // Si es una nota del sistema o una nota manual
            type: DataTypes.STRING
        }
    })
}