const express = require('express');
const { addCotizacionToCRM, updateCotizacionToCRM, changeStateCotizacion } = require('../controllers/cotizacionController');
const router = express.Router();


router.route('/add')
    .post(addCotizacionToCRM)
    .put(updateCotizacionToCRM)

router.route('/state')
    .put(changeStateCotizacion)
module.exports = router;