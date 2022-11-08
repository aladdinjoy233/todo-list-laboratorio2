const Lista = require('./models/Lista');
const Tarea = require('./models/Tarea');
const User = require('./models/User');

// Una lista tiene muchas tareas
Lista.hasMany(Tarea, { as: "tareas", foreignKey: "listaId" });
Tarea.belongsTo(Lista, { as: "lista" });

// Un usuario tiene muchas tareas
User.hasMany(Tarea, { as: "tareas", foreignKey: "userId" });
Tarea.belongsTo(User, { as: "user" });