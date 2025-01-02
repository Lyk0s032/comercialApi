const express = require('express');
const router = express.Router();

const { getUserById, createUser } = require('../controllers/userController');

router.route('/:id')
    .get(getUserById)

router.route('/create')
    .post(createUser)
module.exports = router;