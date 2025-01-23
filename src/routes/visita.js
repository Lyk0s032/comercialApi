const express = require('express');
const { createVisita, cancelVisita, getVisitas, aplazarVisita, SinInteresVisita, getVisita, agendaCotizacion } = require('../controllers/visitasControllers');
const router = express.Router();

// CLIENTES


router.route('/getVisita/:visitaId') // Obtener llamada por usuario.
    .get(getVisita)
router.route('/get/:userId') // Obtener llamada por usuario.
    .get(getVisitas)


router.route('/create')
    .post(createVisita)

router.route('/agendaCotizacion')
    .post(agendaCotizacion)
    
router.route('/cancelar')
    .post(cancelVisita)

router.route('/sinInteres')
    .put(SinInteresVisita)
    
router.route('/aplazar')
    .put(aplazarVisita)



module.exports = router;