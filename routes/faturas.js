import { Router } from 'express';
const router = Router();
import * as faturasController from '../controllers/faturasController.js';

router.get('/', faturasController.getAllFaturas);
router.get('/:id', faturasController.getFaturaById);
router.post('/', faturasController.createFatura);
router.put('/:id', faturasController.updateFatura);
router.delete('/:id', faturasController.deleteFatura);

export default router;
