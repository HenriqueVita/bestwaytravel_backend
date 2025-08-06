const express = require('express');
const router = express.Router();
const controller = require('../controllers/faturasController');

router.get('/', controller.getAllFaturas);
router.get('/:id', controller.getFaturaById);
router.post('/', controller.createFatura);
router.put('/:id', controller.updateFatura);
router.delete('/:id', controller.deleteFatura);

module.exports = router;
