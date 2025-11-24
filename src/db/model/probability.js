const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    sequelize.define('probability', { 
        probability: {
            type: DataTypes.STRING
        },
    }) 
}