var Lista = require('../database/models/Lista');
var Tarea = require('../database/models/Tarea');
var User = require('../database/models/User');
var { Op } = require('sequelize');

// Vistas
exports.index = async (req, res, next) => {
	await actualizarTareas();

	const tareas = await obtenerTareas(req.user);
	const allUsers = await obtenerUsuarios(req.user);
	const {listas, allListas} = await obtenerListas(req.user);

	res.render('todo', { title: 'My todo list | List', tareas, listas, user: req.user, users: allUsers, allListas });
}

exports.cambiarEstado = async (req, res, next) => {
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
}

exports.agregarLista = async (req, res, next) => {
	await Lista.create({
		titulo: req.body.nombreLista,
		creacion: new Date(),
		resolucion: null,
		estado: 'pendiente'
	});

	res.send({redirect: '/todo'});
}

exports.agregarTarea = async (req, res, next) => {
	let { data } = req.body;

	await Tarea.create({
		titulo: data.titulo,
		creacion: new Date(),
		resolucion: null,
		descripcion: data.descripcion ? data.descripcion : null,
		prioridad: data.prioridad,
		fechaLimite: data.limite ? data.limite : null,
		estado: 'pendiente',
		listaId: data.lista == 'null' ? null : data.lista,
		userId: data.userId
	});

	res.send({redirect: '/todo'});
}

exports.borrarLista = async (req, res, next) => {
	let id = req.params.id;

	const lista = await Lista.findByPk(id);
	const tareas = await Tarea.findAll({ where: { listaId: lista.id	} });

	if (tareas.length > 0) {
		for (const tarea of tareas) {
			await tarea.destroy();
		}
	}

	await lista.destroy();
	res.send({redirect: '/todo'});
}

exports.borrarTarea = async (req, res, next) => {
	let id = req.params.id;

	const tarea = await Tarea.findByPk(id);

	await tarea.destroy();

	res.send({redirect: '/todo'});
}

exports.obtenerTarea = async (req, res, next) => {
	let id = req.params.id;
	return res.json(await Tarea.findByPk(id));
}

exports.editarTarea = async (req, res, next) => {
	const id = req.params.id;
	const { data } = req.body;

	await Tarea.update({
		titulo: data.titulo,
		descripcion: data.descripcion ? data.descripcion : null,
		prioridad: data.prioridad,
		fechaLimite: data.limite ? data.limite : null,
		listaId: data.lista == 'null' ? null : data.lista,
		userId: data.userId
	}, { where: { id } });

	res.send({redirect: '/todo'});
}

// Funciones
async function obtenerTareas(userActual) {
	// Trae las demas tareas sin corresponder a una lista
	const tareas = await Tarea.findAll({
		where: {
			listaId: null,
			userId: userActual.id // ERROR
		},
		order: [
			['prioridad', 'ASC']
		]
	})

	return tareas;
}

async function obtenerUsuarios(userActual) {
	return User.findAll({
		where: {
			id: { [Op.not]: userActual.id }
		}
	});
}

async function obtenerListas(userActual) {

	const allListas = await Lista.findAll({
			include: [{
				model: Tarea,
				as: "tareas",
			}],
			order: [
				[{ model: Tarea, as: 'tareas' }, 'prioridad', 'ASC']
			]
	});

	let listas = allListas.filter(lista => {
		for (const tarea of lista.tareas) {
			if (tarea.userId == userActual.id) return true;
		}
		return false;
	})

	return { listas, allListas };
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

		if (lista.tareas.length == 0) {
			if (lista.estado == 'resuelto') {
				lista.estado = 'pendiente';
				lista.resolucion = null;
				lista.save();
			}
			continue;
		}

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
			lista.estado = 'pendiente';
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