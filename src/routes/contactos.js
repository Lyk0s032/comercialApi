const express = require('express');
const router = express.Router();

const { getAllContacts, createContact, updateContact, deleteContact } = require('../controllers/contactosController');

router.route('/get')
    .get(getAllContacts)
    .put(updateContact)
    .delete(deleteContact)
router.route('/add')
    .post(createContact)

module.exports = router;