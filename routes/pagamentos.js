const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagamentosController');

router.get('/', controller.getAllPagamentos);
router.get('/:id', controller.getPagamentoById);
router.post('/', controller.createPagamento);
router.put('/:id', controller.updatePagamento);
router.delete('/:id', controller.deletePagamento);

module.exports = router;
