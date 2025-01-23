const express = require('express');
const { addCotizacionToCRM, updateCotizacionToCRM, changeStateCotizacion, addCotiDesarrollo, aplazarCotizacion, getAllCotizacions, getCotizacionById, getThisMonthCotizacion } = require('../controllers/cotizacionController');
const router = express.Router();

router.route('/get/embudo/mes/:ano/:month/:userId')
    .get(getThisMonthCotizacion)

router.route('/getById/:cotizacionId')
    .get(getCotizacionById)

router.route('/getAll/:userId')
    .get(getAllCotizacions)
router.route('/add')
    .post(addCotizacionToCRM)
    .put(updateCotizacionToCRM)

router.route('/addDesarrollo')
    .post(addCotiDesarrollo)
router.route('/aplazar')
    .put(aplazarCotizacion)

router.route('/state')
    .put(changeStateCotizacion)
module.exports = router;