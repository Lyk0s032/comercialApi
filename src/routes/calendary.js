const express = require('express');
const router = express.Router();

// CLIENTES
const { getCalendary, newEvent, getAllCalendary, updateCalendary, sendEmaiToTalentoHumano } = require('../controllers/calendaryControllers');

router.route('/sendEmail')
    .post(sendEmaiToTalentoHumano)
router.route('/getAll/:userId') // Obtener todos los datos en el calendario
    .get(getAllCalendary)
router.route('/get') // Obtener todos los datos en el calendario
    .get(getCalendary)

router.route('/new')
    .post(newEvent)
    .put(updateCalendary)


module.exports = router;