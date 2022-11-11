function listItemTemplate(id, task) {
	let li = document.createElement('li');
	li.innerHTML = `${task}<a onclick="borrar(${id})"><i class="fa-solid fa-trash"></i></a>`
	li.classList.add('anim-in');
	li.dataset.id = id;
	return li;
}

function agregar() {
	let input = document.querySelector('#new-task');
	const task = input.value.trim();
	if (task === '') {
		input.value = '';
		input.focus();
		return false;
	}
	let list = document.querySelector('ul.task-list');

	fetch('todo/add', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({ task }),
	})
		.then(res => res.json())
		.then(data => {

			const emptyLi = list.querySelector('.empty-list');
			if (emptyLi) {
				emptyLi.classList.add('anim-out', 'just-slide');
				setTimeout(() => {
					list.removeChild(emptyLi)
					let listItem = listItemTemplate(data.id, data.task);
					listItem.classList.add('just-slide')
					list.appendChild(listItem);
				}, 500);
			} else {
				list.appendChild(listItemTemplate(data.id, data.task));
			}

			input.value = '';
		});

	return false;
}

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
