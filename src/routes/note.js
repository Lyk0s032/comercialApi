const express = require('express');
const { addNote, addNoteManual } = require('../controllers/noteControllers');
const router = express.Router();

// CLIENTES

router.route('/create')
    .post(addNote)

router.route('/addManual')
    .post(addNoteManual)



module.exports = router;