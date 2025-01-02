const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('visita', { 
        // Titulo de la visita
        title:{ // Titulo de la visita.
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        state: { // Activa, Cumplida, Perdida, Aplazada,  ( Espera ).
            type: DataTypes.STRING
        },
    })
}