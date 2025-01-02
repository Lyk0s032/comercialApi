const express = require('express');
const router = express.Router();

const userRoutes = require('./user'); // USUARIOS DEL CRM

const prospectoRoutes = require('./prospecto'); // PROSPECTO

const clienteRoutes = require('./client'); // CLIENTE
const contactoRoutes = require('./contactos'); // CONTACTOS DE CLIENTE

// CALL
const callRoutes = require('./call'); // CONTACTOS DE CLIENTE
// VISITAS
const visitaRoutes = require('./visita'); // VISITAS DEL CLIENTE

// CALENDARIO 
const calendaryRoutes = require('./calendary'); // CONTACTOS DE CLIENTE

// NOTAS O REGISTROS
const notesRoutes = require('./note'); // NOTAS DE CLIENTE

// COTIZACION
const cotizacionRoutes = require('./cotizacion'); // COTIZACIONES


router.use('/users', userRoutes);
router.use('/prospecto', prospectoRoutes);
router.use('/clients', clienteRoutes);
router.use('/contactos', contactoRoutes);
router.use('/calendario', calendaryRoutes);
router.use('/call', callRoutes);
router.use('/visitas', visitaRoutes);
router.use('/notes', notesRoutes); 
router.use('/cotizacion', cotizacionRoutes)



module.exports = router;