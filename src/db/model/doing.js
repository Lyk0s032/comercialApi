const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('doing', { 
        // Nombre de cotizacion
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        // Fecha cumplido
        fechaCumplido:{ // Fecha que asigna el sistema de creada.
            type: DataTypes.DATE
        },
        state: { // Pendiente, cumplida
            type: DataTypes.STRING
        }, 
    })
}