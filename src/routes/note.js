const express = require('express');
const { addNote } = require('../controllers/noteControllers');
const router = express.Router();

// CLIENTES

router.route('/create')
    .post(addNote)



module.exports = router;