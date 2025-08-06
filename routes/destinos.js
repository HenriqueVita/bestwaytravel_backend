const express = require('express');
const router = express.Router();
const controller = require('../controllers/destinosController');

router.get('/', controller.getAlldestinos);
router.get('/:id', controller.getDestinoById);
router.post('/', controller.createDestino);
router.put('/:id', controller.updateDestino);
router.delete('/:id', controller.deleteDestino);

module.exports = router;
