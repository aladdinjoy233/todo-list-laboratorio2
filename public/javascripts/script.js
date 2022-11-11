function agregarGrupo() {
	let nameInput = document.querySelector('#nombre_grupo');
	const nombreLista = nameInput.value.trim();
	if (nombreLista === '') {
		nameInput.value = '';
		nameInput.focus();
		return false;
	}

	fetch('todo/add_lista', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ nombreLista }),
	})
		.then(res => res.json())
		.then(data => {
			window.location = data.redirect;
		});

	return false;
}

function agregarTarea() {
	let nameInput = document.querySelector('#nombre_tarea');
	let descInput = document.querySelector('#desc_tarea');
	let prioridadInput = document.querySelector('#prioridad_tarea');
	let listaInput = document.querySelector('#lista_tarea');
	let limiteInput = document.querySelector('#limite_tarea');
	let userInput = document.querySelector('#usuario_tarea');

	if (nameInput.value.trim() === '') {
		nameInput.value = '';
		nameInput.focus();
		return false;
	}

	const data = {
		titulo: nameInput.value,
		descripcion: descInput.value,
		prioridad: prioridadInput.value,
		lista: listaInput.value,
		limite: limiteInput.value,
		userId: userInput.value,
	}

	fetch('todo/add_tarea', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ data }),
	})
		.then(res => res.json())
		.then(data => {
			window.location = data.redirect;
		});

	return false;
}

function borrarTarea(id) {
	fetch(`todo/delete_tarea/${id}`,  {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
	})
		.then(res => res.json())
		.then(data => {
			window.location = data.redirect;
		});
}

function borrarLista(id) {
	console.log(id);
	fetch(`todo/delete_lista/${id}`,  {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
	})
		.then(res => res.json())
		.then(data => {
			window.location = data.redirect;
		});
}

let creationMenu = document.querySelector('.creation-menu');
let newBtn = document.querySelector('.new-btn');

newBtn.addEventListener('click', () => {

	if ( !document.querySelector('#form-grupo').classList.contains('hide-form') ||
			 !document.querySelector('#form-tarea').classList.contains('hide-form')) {
			return;
		}

	if (creationMenu.classList.contains('open')) {
		creationMenu.classList.remove('open');
	} else {
		creationMenu.classList.add('open');
	}
})

let newTaskBtn = document.querySelector('.new-task');
let newGroupBtn = document.querySelector('.new-group');

let cancelTaskBtn = document.querySelector('#close-item-form');
let cencelGroupBtn = document.querySelector('#close-group-form');
let cencelEditBtn = document.querySelector('#close-edit-form');

let darkOverlay = document.querySelector('.dark-overlay');

newGroupBtn.addEventListener('click', () => {
	document.querySelector('#form-grupo').classList.remove('hide-form');
	darkOverlay.classList.add('show');
	creationMenu.classList.remove('open');
})

cencelGroupBtn.addEventListener('click', () => {
	document.querySelector('#form-grupo').classList.add('hide-form');
	darkOverlay.classList.remove('show');
})

newTaskBtn.addEventListener('click', () => {
	document.querySelector('#form-tarea').classList.remove('hide-form');
	darkOverlay.classList.add('show');
	creationMenu.classList.remove('open');
})

cancelTaskBtn.addEventListener('click', () => {
	document.querySelector('#form-tarea').classList.add('hide-form');
	darkOverlay.classList.remove('show');
})

cencelEditBtn.addEventListener('click', () => {
	document.querySelector('#form-edit').classList.add('hide-form');
	darkOverlay.classList.remove('show');
})

const cambiarEstado = tareaId => {
	fetch(`todo/cambiar_estado/${tareaId}`, {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
	})
		.then(res => res.json())
		.then(res => {
			if (res == null) return;

			const {tarea, lista} = res;

			let listaDiv = lista != null ? document.querySelector(`#lista-${lista.id}`) : '';
			let tareaDiv = document.querySelector(`#tarea-${tarea.id}`);

			// Si la tarea esta pendiente, marcar como pendiente en el DOM
			if (tarea.estado == 'pendiente') {
				tareaDiv.classList.remove('completo');

				const fechaDiv = tareaDiv.querySelector('.item-fechas');
				const fecha = tareaDiv.querySelector('.fecha-resolucion');

				fechaDiv.removeChild(fecha);
			};

			// Si la tarea esta resuelto, marcar como resuelto en el DOM
			if (tarea.estado == 'resuelto') {
				tareaDiv.classList.add('completo');

				let fecha = document.createElement('div');
				fecha.classList.add('item-fecha');
				fecha.classList.add('fecha-resolucion');
				const resolucion = new Date(tarea.resolucion).toISOString().slice(0,10).replace(/-/g,"-");
				fecha.innerHTML = `Resuelto: ${resolucion}`;

				const fechaDiv = tareaDiv.querySelector('.item-fechas');
				fechaDiv.appendChild(fecha);
			};

			if (lista == null) return;

			// Si se descompleto la lista, marcar como pendiente
			if (lista.estado == 'pendiente') {
				listaDiv.classList.remove('completo');

				const fechaDiv = listaDiv.querySelector('.lista-fechas');
				const fecha = listaDiv.querySelector('.lista-fecha-resolucion');

				if (fecha) {
					fechaDiv.removeChild(fecha);
				}
			}

			// Si se completo la lista, marcar como resuelta
			if (lista.estado == 'resuelto') {
				listaDiv.classList.add('completo');

				let fecha = document.createElement('div');
				fecha.classList.add('lista-fecha');
				fecha.classList.add('lista-fecha-resolucion');
				const resolucion = new Date(lista.resolucion).toISOString().slice(0,10).replace(/-/g,"-");
				fecha.innerHTML = `Resuelto: ${resolucion}`;

				const fechaDiv = listaDiv.querySelector('.lista-fechas');
				fechaDiv.appendChild(fecha);
			}
		});
}

// Abrir submenu
let listaSettingBtns = document.querySelectorAll('.lista-settings');
let submenus = document.querySelectorAll('.submenu');

let listaBtnClicked = false;

listaSettingBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		listaBtnClicked = true;
		let submenu = btn.nextElementSibling;
		if (submenu.classList.contains('open')) {
			submenu.classList.remove('open');
		} else {
			submenus.forEach(menu => menu.classList.remove('open'));
			submenu.classList.add('open');
		}
		setTimeout(() => {
			listaBtnClicked = false;
		}, 0);
	})
})

document.addEventListener('click', event => {
	const menu = document.querySelector('.submenu.open');

	if (!menu) return;
	const isClickInside = menu.contains(event.target)

	if (!isClickInside && !listaBtnClicked) {
		menu.classList.remove('open');
	}
})

function abrirEditar(id) {

	fetch(`todo/obtener_tarea/${id}`)
		.then(res => res.json())
		.then(res => {

			// Obtener todos los inputs y llenarlos con informacion
			const editarForm     = document.querySelector('#form-edit');
			const idInput        = editarForm.id_edit;
			const nombreInput    = editarForm.nombre_edit;
			const descInput      = editarForm.desc_edit;
			const prioridadInput = editarForm.prioridad_edit;
			const listaInput     = editarForm.lista_edit;
			const userInput      = editarForm.user_edit;
			const limiteInput    = editarForm.limite_edit;

			idInput.value        = res.id;
			nombreInput.value    = res.titulo;
			descInput.value      = res.descripcion ? res.descripcion : '';
			prioridadInput.value = res.prioridad;
			listaInput.value     = res.listaId;
			userInput.value      = res.userId;
			limiteInput.value    = res.fechaLimite;

			document.querySelector('#form-edit').classList.remove('hide-form');
			darkOverlay.classList.add('show');
			creationMenu.classList.remove('open');
		})
}

function editarTarea() {
	// Obtener todos los inputs
	const editarForm     = document.querySelector('#form-edit');
	const idInput        = editarForm.id_edit;
	const nombreInput    = editarForm.nombre_edit;
	const descInput      = editarForm.desc_edit;
	const prioridadInput = editarForm.prioridad_edit;
	const listaInput     = editarForm.lista_edit;
	const userInput      = editarForm.user_edit;
	const limiteInput    = editarForm.limite_edit;

	if (nombreInput.value.trim() === '') {
		nombreInput.value = '';
		nombreInput.focus();
		return false;
	}

	const data = {
		titulo: nombreInput.value,
		descripcion: descInput.value,
		prioridad: prioridadInput.value,
		lista: listaInput.value,
		userId: userInput.value,
		limite: limiteInput.value,
	}

	fetch(`todo/editar_tarea/${idInput.value}`, {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ data }),
	})
		.then(res => res.json())
		.then(data => {
			window.location = data.redirect;
		});

	return false;
}