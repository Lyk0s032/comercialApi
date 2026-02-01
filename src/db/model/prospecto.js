const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('prospecto', { 
        // Estado... Activo o innactivo
        nombreEmpresa: {
            type: DataTypes.STRING
        },
        // PErsona
        namePersona:{
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
        type: { // TIPO - Persona, Empresa
            type: DataTypes.STRING
        },
        // Cargo responsalbe
        cargo:{
            type: DataTypes.STRING
        },
        // ACTUALIZACION FELIPE
        url: {
            type: DataTypes.STRING
        },
        direccion:{
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        fijo: {
            type: DataTypes.STRING
        },
        mensaje:{
            type: DataTypes.TEXT
        },
        state: { // Proceso, Perdido, Ganado
            type: DataTypes.STRING
        }
    })
}