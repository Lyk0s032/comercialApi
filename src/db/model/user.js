const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('user', { 
        // Nombre
        name: {
            type: DataTypes.STRING
        },
        // Imagen de perfil
        lastName:{
            type: DataTypes.STRING
        },
        // Nick
        nick:{
            type: DataTypes.STRING
        },
        // Phone
        phone: {
            type: DataTypes.STRING
        },
        // Email
        email:{
            type: DataTypes.STRING
        },
        // Password
        password: {
            type: DataTypes.STRING
        },
        // photo
        photo:{
            type: DataTypes.TEXT
        },
        age: {
            type: DataTypes.INTEGER
        },
        // Estado... Activo o innactivo
        state: {
            type: DataTypes.STRING
        }, // Rango
        rango: {
            type: DataTypes.STRING
        }

    })
}