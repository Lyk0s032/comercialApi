const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('meta', { 
        // Metas
        visitas: {
            type: DataTypes.INTEGER
        },
        // NIT
        llamadas: {
            type: DataTypes.INTEGER
        },
        // Nro
        cotizaciones: {
            type: DataTypes.INTEGER
        },
        // QR
        valor:{ // QR IMAGEN
            type: DataTypes.STRING
        },
        fecha: {
            type: DataTypes.DATE
        },
        state: {
            type: DataTypes.STRING
        }
    })
}