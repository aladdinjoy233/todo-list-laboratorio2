var express = require('express');
var router = express.Router();

var Lista = require('../database/models/Lista');
var Tarea = require('../database/models/Tarea');
var { Op } = require('sequelize');

router.get('/', async (req, res, next) => {
	await actualizarTareas();

	const {listas, tareas} = await obtenerTareas();

	res.render('todo', { title: 'My todo list | List', tareas, listas });
});

router.get('/obtener', async (req, res, next) => {
	const { listas, tareas } = await obtenerTareas();
	
	// res.send(JSON.stringify({listas, tareas}));
	res.json({listas, tareas});
});

router.post('/cambiar_estado/:id', async (req, res, next) => {
	let id = req.params.id;
	const tarea = await Tarea.findByPk(id);

	if (tarea.fechaLimite) {
		const fechaTarea = new Date(tarea.fechaLimite);
		const hoy = new Date();

		if (fechaTarea < hoy) {
			res.json(null);
			return;
		}
	}
	await cambiarEstado(tarea);

	if (tarea.listaId == null) {
		res.json({tarea, lista: null});
		return;
	}

	const lista = await Lista.findByPk(tarea.listaId, {
		include: [{
			model: Tarea,
			as: "tareas"
		}]
	});

	let estadoCompleto = tarea.estado == "resuelto" ? true : false;

	if (!estadoCompleto && lista.estado != 'pendiente') {
		lista.estado = 'pendiente';
		lista.resolucion = null;
		await lista.save();
		res.json({tarea, lista});
		return;
	}

	let todasCompletas = true;

	for (const liTarea of lista.tareas) {
		if (liTarea.estado != 'resuelto') {
			todasCompletas = false;
			break;
		}
	}

	if (todasCompletas && lista.estado != 'resuelto') {
		lista.estado = 'resuelto';
		lista.resolucion = new Date();
	}
	await lista.save();

	res.json({tarea, lista});
});

// router.post('/add', function(req, res, next) {
// 	const { cookies } = req;

// 	if ('tasks' in cookies) {

// 		let tasksObj = JSON.parse(cookies.tasks);
// 		let newId;
// 		if (tasksObj.tasks.length >= 1) {
// 			newId = Math.max( ...tasksObj.tasks.map(a => a.id) ) + 1;
// 		} else {
// 			newId = 1;
// 		}
	
// 		tasksObj.tasks.push({ id: newId, task: req.body.task });
// 		res.cookie('tasks', JSON.stringify(tasksObj));
// 		res.send(JSON.stringify({ id: newId, task: req.body.task }));
// 	} else {
// 		let tasksObj = { tasks: [{ id: 1, task: req.body.task }] };
// 		res.cookie('tasks', JSON.stringify(tasksObj));
// 		res.send(JSON.stringify({ id: 1, task: req.body.task }));
// 	}

// });

// router.post('/delete/:id', function(req, res, next) {
// 	const { cookies } = req;
// 	let id = req.params.id;

// 	if (typeof id == 'string') id = Number(id);

// 	if ('tasks' in cookies) {

// 		let tasksObj = JSON.parse(cookies.tasks);

// 		let idArr = tasksObj.tasks.map(a => a.id);

// 		if (!idArr.includes(id)) return res.status(500).send('Not found');

// 		const indexOfObj = tasksObj.tasks.findIndex(obj => obj.id == id );
		
// 		const removedItem = tasksObj.tasks.splice(indexOfObj, 1);

// 		res.cookie('tasks', JSON.stringify(tasksObj));
// 		res.send(JSON.stringify(removedItem));
// 	} else {
// 		res.redirect('/');
// 	}

// });

async function obtenerTareas() {
	// Trae todas las listas con sus tareas
	const listas = await Lista.findAll({
		include: [{
			model: Tarea,
			as: "tareas"
		}],
		order: [
			[{ model: Tarea, as: 'tareas' }, 'prioridad', 'ASC']
		]

	});

	// Trae las demas tareas sin corresponder a una lista
	const tareas = await Tarea.findAll({
		where: {
			listaId: null
		},
		order: [
			['prioridad', 'ASC']
		]
	})

	return { listas, tareas };
}

async function actualizarTareas() {
	const tareas = await Tarea.findAll();

	let hoy = new Date();

	for (const tarea of tareas) {
		if (tarea.fechaLimite == null || tarea.estado == "resuelto") {
			continue;
		}
		const fechaTarea = new Date(tarea.fechaLimite);
	
		if (fechaTarea < hoy) {
			await cambiarEstado(tarea, fechaTarea);
		}
		
	}

	const listas = await Lista.findAll({
		include: [{
			model: Tarea,
			as: "tareas"
		}]
	});

	for (const lista of listas) {

		let todasCompletas = true;

		for (const liTarea of lista.tareas) {
			if (liTarea.estado != 'resuelto') {
				todasCompletas = false;
			}
		}

		if (todasCompletas && lista.estado != 'resuelto') {
			lista.estado = 'resuelto';
			lista.resolucion = hoy;
		}
		
		if (!todasCompletas && lista.estado != 'pendiente') {
			lista.estado = 'resuelto';
			lista.resolucion = null;
		}

		await lista.save();

	}
}

async function cambiarEstado(tarea, date = new Date()) {

	if (tarea.estado == "pendiente") {
		tarea.estado = "resuelto";
		tarea.resolucion = date;
	} else {
		tarea.estado = "pendiente";
		tarea.resolucion = null;
	}

	await tarea.save();
	return tarea;
}

module.exports = router;
