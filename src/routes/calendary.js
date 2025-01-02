const express = require('express');
const router = express.Router();

// CLIENTES
const { getCalendary, newEvent } = require('../controllers/calendaryControllers');


router.route('/get') // Obtener todos los datos en el calendario
    .get(getCalendary)

router.route('/new')
    .post(newEvent)


module.exports = router;