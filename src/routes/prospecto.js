const express = require('express');
const { addNote } = require('../controllers/noteControllers');
const { newProspect, newTag, nuevaFuente, deleteTags, 
    deleteFuente, getAllTagsAndFuentes, getAllProspectos, DontCallProspecto, 
    aplazarProspecto, convertirToClient, 
    NoInteresProspecto} = require('../controllers/prospectoController');
const router = express.Router(); 
 
// CLIENTES

router.route('/getAll', getAllProspectos)
    .get(getAllProspectos)
router.route('/get')
    .get(getAllTagsAndFuentes)
router.route('/create')
    .post(newProspect)

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

module.exports = router;