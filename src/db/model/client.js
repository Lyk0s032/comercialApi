const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('client', { 
        photo: {
            type: DataTypes.TEXT
        },
        // Estado... Activo o innactivo
        nombreEmpresa: {
            type: DataTypes.STRING
        },
        nit: {
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
        type: { // Distribuidor - Cliente normal
            type: DataTypes.STRING
        },
        // Sector
        sector: { // Sector de operaciones
            type: DataTypes.STRING
        },
        // Responable
        responsable:{
            type: DataTypes.STRING
        },
        // ACTUALIZACION FELIPE
        url: {
            type: DataTypes.STRING
        },
        direccion:{
            type: DataTypes.STRING
        },
        fijo: {
            type: DataTypes.STRING
        },
        ciudad: {
            type: DataTypes.STRING
        },
        state: { // Activo , inactivo
            type: DataTypes.STRING
        }
    })
}