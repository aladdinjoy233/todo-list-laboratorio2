const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class Lista extends Model {};

Lista.init({

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	titulo: DataTypes.STRING,
	creacion: DataTypes.DATE,
	resolucion: DataTypes.DATE,
	estado: {
		type: DataTypes.STRING,
		allowNull: false
	}

}, {
	sequelize,
	timestamps: true,
	updatedAt: false,
	createdAt: 'creacion',
	modelName: 'lista',
	tableName: 'lista',
});

module.exports = Lista;