const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('call', { 
        // Titulo de la visita
        title:{ // Titulo de la visita.
            type: DataTypes.STRING
        }, 
        // Especifica si es Contacto 1, Contacto 2, o Contacto 3
        case: {
            type: DataTypes.STRING
        },
        // Estado... Activo o innactivo
        state: { // Activa, Cumplida, Perdida, Aplazada , ( Espera ).
            type: DataTypes.STRING
        },
    });
}