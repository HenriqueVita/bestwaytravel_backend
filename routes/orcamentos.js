const express = require('express');
const router = express.Router();
const controller = require('../controllers/orcamentosController');

router.get('/', controller.getAllOrcamentos);
router.get('/:id', controller.getOrcamentoById);
router.post('/', controller.createOrcamento);
router.put('/:id', controller.updateOrcamento);
router.delete('/:id', controller.deleteOrcamento);

module.exports = router;
