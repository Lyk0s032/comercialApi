const express = require('express');
const { addCotizacionToCRM, updateCotizacionToCRM, changeStateCotizacion, addCotiDesarrollo, aplazarCotizacion, getAllCotizacions, getCotizacionById, getThisMonthCotizacion, getNotesByCotizacion, giveProbability, findClientByNIT, changeEstadoCotizacion, addNoteCotizacion, createDoing, updateDoingState, getPendingDoingsByUser } = require('../controllers/cotizacionController');
const router = express.Router();

router.route('/getNotes/notes/:cotizacionId')
    .get(getNotesByCotizacion)
    
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
 
router.route('/give/calification/')
    .post(giveProbability)

// Encontrar cliente
router.route('/give/clientByNit/:nit')
    .get(findClientByNIT);

router.route('/estado')
    .put(changeEstadoCotizacion)

router.route('/notes/add')
    .post(addNoteCotizacion)

router.route('/doing')
    .post(createDoing)

router.route('/doing/state')
    .put(updateDoingState)

router.route('/doing/pendientes/:userId')
    .get(getPendingDoingsByUser)
    
module.exports = router;