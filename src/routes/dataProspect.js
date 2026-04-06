const express = require('express');
const {
    createDataProspect,
    getDataProspect,
    updateDataProspectField,
} = require('../controllers/dataProspectController');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────
// Rutas de DataProspect
// Base: /api/data-prospect
// ─────────────────────────────────────────────────────────────────

// POST   /api/data-prospect/create
// Crea el registro de datos del prospecto (una sola vez por prospecto)
router.route('/create')
    .post(createDataProspect);

// PATCH  /api/data-prospect/update/:prospectoId
// Actualiza uno o varios campos del registro de datos (campo por campo)
// ⚠ Debe ir ANTES de /:prospectoId para que Express no lo confunda
router.route('/update/:prospectoId')
    .patch(updateDataProspectField);

// GET    /api/data-prospect/:prospectoId
// Obtiene el registro de datos de un prospecto por su ID
router.route('/:prospectoId')
    .get(getDataProspect);

module.exports = router;
