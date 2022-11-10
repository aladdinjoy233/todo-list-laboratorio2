const jwt = require('jsonwebtoken');
var User = require('../database/models/User');
const { promisify } = require('util');
const { jwtConfig } = require('../config');

const passport = require('passport');

exports.signup = (req, res, next) => {
	passport.authenticate('signup', { session: false }, (err, user, info) => {
		if (err) return next(err)

		if (!user) {

			// Si da el error de missing credentials, devlolver
			if (info.message == 'Missing credentials')
				return res.render('register', { title: 'Register', error: true, errorMsg: ['Campos no pueden ser vacios'] })

			return res.render('register', { title: 'Register', error: true, errorMsg: [info.message] })
		}
		
		res.redirect('login')

	})(req, res, next)
}

exports.login = (req, res, next) => {
	passport.authenticate('login', async (err, user, info) => {
		try {
			// Si hay error, dar error
			if (err) return next(err);
			
			// Si no hay un usuario, dar error del auth.js
			if (!user) return res.render('login', { title: 'Login', error: true, errorMsg: [info.message] })
			
			req.login(user, { session: false }, async (err) => {
				if (err) return next(err)

				const id = user.id;
				const token = jwt.sign({ id }, jwtConfig.secret);

				const cookieOptions = {
					expires: new Date(Date.now() + jwtConfig.cookieExpireTime * 24 * 60 * 60 * 1000),
					httpOnly: true
				}

				res.cookie('jwt', token, cookieOptions);
				return res.redirect('/todo');
			})

		} catch(err) {
			return next(err)
		}
	})(req, res, next)
}

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
	req.session.destroy();
	return res.redirect('/');
}

exports.googleLogin = (req, res, next) => {
	passport.authenticate('auth-google', {
		session: false,
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile'
		]		
	}, (err, user, info) => {

		// Si hay error, dar error
		if (err) return next(err);
		
		// Si no hay un usuario, dar error del auth.js
		if (!user) return res.render('login', { title: 'Login', error: true, errorMsg: [info.message] })
		
		req.login(user, { session: false }, async (err) => {
			if (err) return next(err)

			const id = user.id
			const token = jwt.sign({ id }, jwtConfig.secret)

			const cookieOptions = {
				expires: new Date(Date.now() + jwtConfig.cookieExpireTime * 24 * 60 * 60 * 1000),
				httpOnly: true
			}

			res.cookie('jwt', token, cookieOptions);
			return res.redirect('/todo');
		})

	})(req, res, next)
}