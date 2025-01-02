const express = require('express');
const { createVisita, cancelVisita, getVisitas } = require('../controllers/visitasControllers');
const router = express.Router();

// CLIENTES


router.route('/get/:userId') // Obtener llamada por usuario.
    .get(getVisitas)


router.route('/create')
    .post(createVisita)

router.route('/cancelar')
    .post(cancelVisita)



module.exports = router;