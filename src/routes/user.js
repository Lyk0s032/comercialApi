const express = require('express');
const router = express.Router();

const { getUserById, createUser, getAllUserById, getAllAsesores, addMetas, getDataUserByMonth, signIn, isAuthenticated } = require('../controllers/userController');

// router.route('/sign/validate')
//     .get(isAuthenticated)

router.route('/sign/in')
    .post(signIn)
router.route('/get/all/:userId')
    .get(getAllAsesores)
    
router.route('/get/:asesorId')
    .get(getAllUserById)
router.route('/:id')
    .get(getUserById)

router.route('/create')
    .post(createUser)

router.route('/addMeta')
    .post(addMetas)

router.route('/getByMonth/:ano/:month/:userId')
    .get(getDataUserByMonth)
module.exports = router;