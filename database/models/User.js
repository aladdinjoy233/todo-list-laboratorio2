const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class User extends Model {};

User.init({

	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	nombre: DataTypes.STRING,
	usuario: DataTypes.STRING,
	password: DataTypes.STRING,

}, {
	sequelize,
	modelName: 'user',
	tableName: 'user',
});

module.exports = User;