const { Sequelize, Op} = require('sequelize');

// Importe.
const modelUser = require('./model/user'); // User

const modelTags = require('./model/tags');
const modelProspecto = require('./model/prospecto');
const modelFuente = require('./model/fuente');

// Cliente...
const modelClient = require('./model/client');   // Cliente
const modelContactos = require('./model/contacts'); // Contactos - Del cliente.
// Modelos de estado de clientes
const modelCall = require('./model/contactar'); // Contacto 1, 2 , 3
const modelVisita = require('./model/visitas'); // Visitas

// Calendario
const modelCalendary = require('./model/calendary'); // Calendario de actividades

// Registro o notas
const modelNotes = require('./model/notes');

// Modelo de cotizacion
const modelCotizacion = require('./model/cotizacion');
const entorno = false;

let dburl = entorno ? '' : 'postgres:postgres:123@localhost:5432/comercial';
 
const sequelize = new Sequelize(dburl, {
    logging: false,
    native: false,
});
  
 
    
// Modelos
modelUser(sequelize);
modelTags(sequelize);
modelFuente(sequelize);
modelProspecto(sequelize);
modelClient(sequelize);                // Cliente
modelContactos(sequelize);
modelCall(sequelize);
modelVisita(sequelize);
modelCalendary(sequelize);
modelNotes(sequelize);
modelCotizacion(sequelize)            // Cotizacion


const { user, tag, fuente, prospecto, client, contact, call, visita, calendary, register, cotizacion } = sequelize.models;

// FUENTES Y PROSPECTOS

// Relación uno a muchos
fuente.hasMany(prospecto, {
  foreignKey: 'fuenteId', // Clave foránea en la table prospecto
});

prospecto.belongsTo(fuente);

// LISTA DE CONTACTOS 

// Relacionamos el cliente con los contactos de comunicacion.
// Relación uno a muchos
client.hasMany(contact, {
    foreignKey: 'clientId', // Clave foránea en la tabla contact
    onDelete: 'CASCADE',    // Opcional: elimina los posts si se elimina el usuario
  });
  
contact.belongsTo(client);


// Relacionamos el cliente con los contactos de comunicacion.
// Relación uno a muchos
user.hasMany(contact, {
    foreignKey: 'userId', // Clave foránea en la tabla contact
    onDelete: 'CASCADE',    // Opcional: elimina los posts si se elimina el usuario
  });
  
contact.belongsTo(user);

//- -------------------------------------------
// RELACIONES DEL CALENDARIO
//- -------------------------------------------

// RELACION DE LAS LLAMADAS Y EL CALENDARIO
call.hasMany(calendary, {
  foreignKey: 'callId',
  onDelete: 'CASCADE'
});
calendary.belongsTo(call)

// RELACION DE LAS VISITAS Y EL CALENDARIO
visita.hasMany(calendary, {
  onDelete: 'CASCADE'
});
calendary.belongsTo(visita)

// RELACION DE LOS PROSPECTOS Y EL CALENDARIO
prospecto.hasMany(calendary, {
  foreignKey: 'prospectoId',
  onDelete: 'CASCADE'
});
calendary.belongsTo(prospecto)


// RELACION DEL CALENDARIO Y EL USUARIO
user.hasMany(calendary, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
calendary.belongsTo(user)

// RELACION DEL CALENDARIO Y EL CLIENTE
client.hasMany(calendary, {
  foreignKey: 'clientId',
  onDelete: 'CASCADE'
});
calendary.belongsTo(client)
 



//- -------------------------------------------
// FIN DE RELACIONES DEL CALENDARIO
//- -------------------------------------------


//- -------------------------------------------
// RELACIONES DEL LLAMADAS
//- -------------------------------------------



// RELACION DEL LLAMADAS Y EL USUARIO
user.hasMany(call, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
call.belongsTo(user)

// RELACION DE LLAMADAS Y EL CLIENTE
client.hasMany(call, {
  foreignKey: 'clientId',
  onDelete: 'CASCADE'
});
call.belongsTo(client)

//- -------------------------------------------
// FIN DE RELACIONES DE LLAMADAS
//- -------------------------------------------




//- -------------------------------------------
// RELACIONES DEL VISITAS
//- -------------------------------------------

 
// RELACION DEL VISITAS Y EL USUARIO
user.hasMany(visita, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
visita.belongsTo(user)

// RELACION DE LLAMADAS Y EL CLIENTE
client.hasMany(visita, {
  foreignKey: 'clientId',
  onDelete: 'CASCADE'
});
visita.belongsTo(client)

//- -------------------------------------------
// FIN DE RELACIONES DE VISITAS
//- -------------------------------------------


//- -------------------------------------------
// RELACION DE LAS NOTAS
//- -------------------------------------------

call.hasMany(register, {
  foreignKey: 'callId',
  onDelete: 'CASCADE'
});
register.belongsTo(call)
 

visita.hasMany(register, {
  onDelete: 'CASCADE'
});
register.belongsTo(visita)


prospecto.hasMany(register, {
  foreignKey: 'prospectoId',
  onDelete: 'CASCADE'
});
register.belongsTo(prospecto)

 

// CALENDARIO
calendary.hasMany(register, {
  foreignKey: 'calendaryId',
  onDelete: 'CASCADE'
});
register.belongsTo(calendary)

// RELACION DEL CALENDARIO Y EL USUARIO
user.hasMany(register, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
register.belongsTo(user)

// RELACION DEL CALENDARIO Y EL CLIENTE
client.hasMany(register, {
  foreignKey: 'clientId',
  onDelete: 'CASCADE'
}); 
register.belongsTo(client)

 
//- -------------------------------------------
// FIN DE RELACIONES DE LAS NOTAS ( REGISTERS )
//- -------------------------------------------





//- -------------------------------------------
// RELACION DE LAS COTIZACIONES
//- -------------------------------------------

client.hasMany(cotizacion, {
  foreignKey: 'clientId',
  onDelete: 'CASCADE'
});
cotizacion.belongsTo(client)


user.hasMany(cotizacion, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
cotizacion.belongsTo(user)

 

// CALENDARIO
cotizacion.hasMany(register, {
  foreignKey: 'cotizacionId',
  onDelete: 'CASCADE'
});
register.belongsTo(cotizacion)

// RELACION DEL CALENDARIO Y EL USUARIO
cotizacion.hasMany(calendary, {
  foreignKey: 'cotizacionId',
  onDelete: 'CASCADE'
});
calendary.belongsTo(cotizacion)


//- -------------------------------------------
// FIN DE RELACIONES DE LAS COTIZACIONES
//- -------------------------------------------




// Exportamos.
module.exports = {
    ...sequelize.models,
    db: sequelize,
    Op
}        