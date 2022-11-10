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
	},

	googleConfig: {
		GOOGLE_CLIENT_ID: '559738451157-14o9tpj2df24mu26pur5cjed8jlh9qhu.apps.googleusercontent.com',
		GOOGLE_CLIENT_SECRET: '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',
	}
	
}