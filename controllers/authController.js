const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
var User = require('../database/models/User');
const { promisify } = require('util');
const { jwtConfig } = require('../config');

// Procedimiento para registarse
exports.register = async (req, res) => {
	const name = req.body.usuario_nombre;
	const user = req.body.usuario_user;
	const pass = req.body.usuario_pass;
	let passHash = await bcryptjs.hash(pass, 8);

	const usuarioCreado = await User.create({ nombre: name, usuario: user, password: passHash });

	res.redirect('/login');
};

exports.login = async (req, res) => {
	const user = req.body.usuario_login;
	const pass = req.body.usuario_pass;

	if (user == '' || pass == '') {

		let errorMsg = [];

		user == '' ? errorMsg.push('Usuario no puede ser vacio') : '';
		pass == '' ? errorMsg.push('Password no puede ser vacia') : '';

		res.render('login', {
			title: 'Login',
			error: true,
			errorMsg
		})
	} else {
		const usuario = await User.findOne({ where: { usuario: user } });

		if (usuario == null) {
			res.render('login', {
				title: 'Login',
				error: true,
				errorMsg: ['Usuario no encontrado']
			})
			return;
		}
		
		if (!(await bcryptjs.compare(pass, usuario.password))) {
			res.render('login', {
				title: 'Login',
				error: true,
				errorMsg: ['Password equivocado']
			})
			return;
		}

		const id = usuario.id;
		const token = jwt.sign({ id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime });

		const cookieOptions = {
			expires: new Date(Date.now() + jwtConfig.cookieExpireTime * 24 * 60 * 60 * 1000),
			httpOnly: true
		}

		res.cookie('jwt', token, cookieOptions);
		res.redirect('/todo');

	}

};

exports.isAuthenticated = async (req, res, next) => {
	if (req.cookies.jwt) {
		const decodificada = await promisify(jwt.verify)(req.cookies.jwt, jwtConfig.secret);

		const usuario = User.findByPk(decodificada.id);

		if (usuario == null) return next();

		req.user = await usuario;
		return next();
	} else {
		res.redirect('login');
		next();
	}
}

exports.logout = (req, res) => {
	res.clearCookie('jwt');
	return res.redirect('/');
}