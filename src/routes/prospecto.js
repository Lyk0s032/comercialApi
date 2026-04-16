const express = require('express');
const { addNote } = require('../controllers/noteControllers');
const { newProspect, newTag, nuevaFuente, deleteTags, 
    deleteFuente, getAllTagsAndFuentes, getAllProspectos, DontCallProspecto, 
    aplazarProspecto, convertirToClient, 
    NoInteresProspecto,
    getFuente,
    newProspectExternal,
    getProspectosWithDataFilter,
    updateProspecto} = require('../controllers/prospectoController');
const router = express.Router(); 
 
// CLIENTES

router.route('/getAll', getAllProspectos)
    .get(getAllProspectos)
router.route('/get')
    .get(getAllTagsAndFuentes)
router.route('/create')
    .post(newProspect)
router.route('/external/prospects')
    .post(newProspectExternal)
// EMBUDO
router.route('/dontCall')
    .put(DontCallProspecto)

router.route('/aplazar')
    .put(aplazarProspecto)

router.route('/sinInteres')
    .put(NoInteresProspecto)


router.route('/createClient')
    .post(convertirToClient)


router.route('/addTag')
    .post(newTag)
router.route('/deleteTag/:id')
    .delete(deleteTags); // Eliminar tag por ID

router.route('/addFuente')
    .post(nuevaFuente)
    .put(deleteFuente)

router.route('/getFuente/:nameFuente') 
    .get(getFuente)

// Prospectos + dataProspect con filtros combinables
// Filtros por query params: desde, hasta, fuenteId, venta, asesorAsignado, valorCotizadoMin, valorCotizadoMax
router.route('/getAllWithData')
    .get(getProspectosWithDataFilter)

// Actualizar prospecto por ID
router.route('/update/:id')
    .put(updateProspecto)

module.exports = router;