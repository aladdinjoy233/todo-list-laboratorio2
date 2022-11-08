var express = require('express');
var router = express.Router();

var authController = require('../controllers/authController');
var todoController = require('../controllers/todoController');

// Main todo page
router.get('/', authController.isAuthenticated, todoController.index)

// POST para cambiar el estado de la tarea (resuelto o pendiente)
router.post('/cambiar_estado/:id', authController.isAuthenticated, todoController.cambiarEstado)

// POST para agregar una lista de tareas
router.post('/add_lista', authController.isAuthenticated, todoController.agregarLista)

// POST para agregar una tarea
router.post('/add_tarea', authController.isAuthenticated, todoController.agregarTarea)

// POST para borrar una lista
router.post('/delete_lista/:id', authController.isAuthenticated, todoController.borrarLista)

// POST para borrar una tarea
router.post('/delete_tarea/:id', authController.isAuthenticated, todoController.borrarTarea)

module.exports = router;
