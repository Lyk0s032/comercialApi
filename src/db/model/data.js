const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('dataProspect', { 
        // Referencia de la categoria
        categoria: {
            type: DataTypes.STRING
        },
        // Referencia del producto
        categoriaProducto:{
            type: DataTypes.STRING
        },
        // Estado de la venta
        venta:{
            type: DataTypes.BOOLEAN
        },
        // Se cotizo o no se cotizo
        cotizado:{
            type: DataTypes.BOOLEAN
        },
        valorCotizado: { // VALOR POR EL QUE SE COTIZO
            type: DataTypes.STRING
        },
        // Cargo responsalbe
        asesorAsignado:{
            type: DataTypes.INTEGER
        },
        // ACTUALIZACION FELIPE
        motivoDescripcion: {
            type: DataTypes.TEXT
        },
        state: { // 
            type: DataTypes.STRING
        }
    })
}