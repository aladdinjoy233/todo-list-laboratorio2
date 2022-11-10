const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const bcryptjs = require('bcryptjs')

const User = require('../database/models/User')

passport.use('signup', new localStrategy({
	usernameField    : 'usuario_user',
	passwordField    : 'usuario_pass',
	passReqToCallback: true
}, async (req, username, password, done) => {

	// Verificar que el campo del nombre no sea vacio
	if (req.body.usuario_nombre == '') {
		return done(null, false, { message: 'Campos no pueden ser vacios' })
	}

	// Buscar al usuario, si existe, devolver error
	const buscarUser = await User.findOne({ where: { usuario: username } });
	if (buscarUser != null)
		return done(null, false, { message: 'Usuario ya existe' })

	// Hashear contraseña y guardar usuario
	let passHash = await bcryptjs.hash(password, 8);
	const user = await User.create({ nombre: req.body.usuario_nombre, usuario: username, password: passHash });
	return done(null, user);
}))

passport.use('login', new localStrategy({
		usernameField: 'usuario_login',
		passwordField: 'usuario_pass'
	},
	async (username, password, done) => {
		const user = await User.findOne({ where: { usuario: username } })
		
		// Si no existe el usuario, devolver error
		if (user == null) return done(null, false, { message: 'Usuario equivocado' })

		// Validar que la contraseña sea correcta
		const validate = await bcryptjs.compare(password, user.password);
		if (!validate) return done(null, false, { message: 'Contraseña equivocado' })

		return done(null, user, { message: 'Se pude logear!' });
	}
));