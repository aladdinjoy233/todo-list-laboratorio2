module.exports = {

	database: {
		username: 'root',
		password: '',
		database: 'todo-lab2',
		host: 'localhost',
	},

	jwtConfig: {
		secret: 'super_secret_password',
		expireTime: '7d',
		cookieExpireTime: '90',
	}
	
}