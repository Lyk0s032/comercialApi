const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('tag', { 
        // Nombre de fuente
        nombre: {
            type: DataTypes.STRING
        },
        // Nro
        type: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        }
    })
}