const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('noteCotizacion', { 
        // Nombre de cotizacion
        note: {
            type: DataTypes.TEXT
        }, 
        imagen: {
            type: DataTypes.TEXT
        },
        estado: { // guardado, Editado, Eliminado.
            type: DataTypes.STRING
        }
    })
}