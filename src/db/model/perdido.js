const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('perdido', { 
        // Tipo - Visita o llamada o Prospecto
        why: {
            type: DataTypes.STRING
        },
        tags: {
            type: DataTypes.ARRAY
        },
        state: {
            type: DataTypes.STRING
        }

    })
}