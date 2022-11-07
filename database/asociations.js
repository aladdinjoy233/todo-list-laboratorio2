const Lista = require('./models/Lista');
const Tarea = require('./models/Tarea');

// Una lista tiene muchas tareas
Lista.hasMany(Tarea, { as: "tareas", foreignKey: "listaId" });
Tarea.belongsTo(Lista, { as: "lista" });