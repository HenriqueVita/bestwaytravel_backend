import { Router } from 'express';
const router = Router();
import * as destinosController from '../controllers/destinosController.js';

router.get('/', destinosController.getAllDestinos);
router.get('/:id', destinosController.getDestinoById);
router.post('/', destinosController.createDestino);
router.put('/:id', destinosController.updateDestino);
router.delete('/:id', destinosController.deleteDestino);

export default router;