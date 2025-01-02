const express = require('express');
const router = express.Router();

// CLIENTES
const { getCall, createCall, DontCall, SinInteresLlamada, aplazarCall, agendaVisita, getCalls } = require('../controllers/callControllers');


router.route('/get/:userId') // Obtener llamada por usuario.
    .get(getCalls)

router.route('/get/:callId') // Obtener llamada especifica.
    .get(getCall)

router.route('/create')
    .post(createCall)

router.route('/dontCall')
    .put(DontCall)

router.route('/sinInteres')
    .put(SinInteresLlamada)

router.route('/aplazar')
    .put(aplazarCall)

router.route('/agendaVisita')
    .post(agendaVisita)


module.exports = router;