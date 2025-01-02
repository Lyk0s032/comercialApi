const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('fuente', { 
        // Nombre de fuente
        nombre: {
            type: DataTypes.STRING
        },
        // NIT
        urlForm: {
            type: DataTypes.TEXT
        },
        // Nro
        type: {
            type: DataTypes.STRING
        },
        // QR
        imgQR:{ // QR IMAGEN
            type: DataTypes.TEXT
        },
        state: {
            type: DataTypes.STRING
        }
    })
}