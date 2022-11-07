const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class Tarea extends Model {};

Tarea.init({

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	titulo: DataTypes.STRING,
	creacion: DataTypes.DATE,
	resolucion: DataTypes.DATE,
	descripcion: DataTypes.STRING,
	prioridad: DataTypes.INTEGER,
	fechaLimite: DataTypes.DATE,
	estado: {
		type: DataTypes.STRING,
		allowNull: false
	},
	listaId: DataTypes.INTEGER,

}, {
	sequelize,
	timestamps: true,
	updatedAt: false,
	createdAt: 'creacion',
	modelName: 'tarea',
	tableName: 'tarea',
	freezeTableName: true
});

module.exports = Tarea;