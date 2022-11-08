const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
var User = require('../database/models/User');
const { promisify } = require('util');

// Procedimiento para registarse
exports.register = async (req, res) => {
	const name = req.body.usuario_nombre;
	const user = req.body.usuario_user;
	const pass = req.body.usuario_pass;
	let passHash = await bcryptjs.hash(pass, 8);

	const usuarioCreado = await User.create({ nombre: name, usuario: user, password: passHash });
	res.redirect('/');
}