const express = require('express');
const router = express.Router(); 

// CLIENTES
const { getAllClients, createClient, updateCliente, searchClient, searchCountForType, searchClientWithMoreAprobadas, searchCotizacionsByMonth, searchForGraphDay, searchAllMoneyByMonth, searchClientById, searchCotiByYear, searchAprobadasByMonth } = require('../controllers/clientController');

// CLIENTE
router.route('/get/byMonth/:ano/:month/:clientId')
    .get(searchAprobadasByMonth) 

router.route('/get/client/:clientId')
    .get(searchClientById)

router.route('/get/client/cotizaciones/:clientId')
    .get(searchCotiByYear)
// CLIENTES -
router.route('/dataAndFinance/:ano/:month')
    .get(searchAllMoneyByMonth)

router.route('/graphMonth/:ano/:month/:type') 
    .get(searchForGraphDay)

router.route('/getByMonthGeneral/:ano/:month/')
    .get(searchClientWithMoreAprobadas)
router.route('/countType')
    .get(searchCountForType);

// cotizacions
router.route('/getCotizacionClients')
    .get(searchCotizacionsByMonth)


    // EMBUDO
router.route('/search')
    .get(searchClient) // BUSCADOR A TIEMPO REAL.
router.route('/get') // Obtener todos los clientes
    .get(getAllClients)
    .put(updateCliente) // Actualizar cliente
router.route('/create')
    .post(createClient)

router.route('/update')


module.exports = router;