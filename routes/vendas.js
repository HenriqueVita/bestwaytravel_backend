const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendasController');

router.get('/', controller.getAllVendas);
router.get('/:id', controller.getVendaById);
router.post('/', controller.createVenda);
router.put('/:id', controller.updateVenda);
router.delete('/:id', controller.deleteVenda);

module.exports = router;
