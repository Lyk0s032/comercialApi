const express = require('express');
const router = express.Router();

// CLIENTES
const { getAllClients, createClient, updateCliente } = require('../controllers/clientController');


router.route('/get') // Obtener todos los clientes
    .get(getAllClients)
    .put(updateCliente) // Actualizar cliente
router.route('/create')
    .post(createClient)

router.route('/update')


module.exports = router;