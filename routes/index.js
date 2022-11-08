var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController');

// Routers para las vistas
router.get('/', function(req, res, next) {
  res.render('index', { title: 'My todo list' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

// Routers para los metodos del controlador
router.post('/register', authController.register)

module.exports = router;
