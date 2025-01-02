const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('contact', { 
        // Estado... Activo o innactivo
        nombre: {
            type: DataTypes.STRING
        },
        // Phone
        phone:{
            type: DataTypes.STRING
        },
        // Email
        email:{
            type: DataTypes.STRING
        },
        rango: {
            type: DataTypes.STRING
        },
        state: { // Activo o inactivo
            type: DataTypes.STRING
        }
    })
}