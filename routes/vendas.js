import { Router } from 'express';
const router = Router();
import * as vendasController from '../controllers/vendasController.js';

router.get('/', vendasController.getAllVendas);
router.get('/:id', vendasController.getVendaById);
router.post('/', vendasController.createVenda);
router.put('/:id', vendasController.updateVenda);
router.delete('/:id', vendasController.deleteVenda);

export default router;
