const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class Tarea extends Model {};

Tarea.init({

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	titulo: {
		type: DataTypes.STRING,
		allowNull: false
	},
	creacion: {
		type: DataTypes.DATEONLY,
		allowNull: false
	},
	resolucion: DataTypes.DATEONLY,
	descripcion: DataTypes.STRING,
	prioridad: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	},
	fechaLimite: DataTypes.DATEONLY,
	estado: {
		type: DataTypes.STRING,
		allowNull: false
	},
	listaId: DataTypes.INTEGER,
	userId: DataTypes.INTEGER,

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