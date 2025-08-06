import { Router } from 'express';
const router = Router();
import * as pagamentosController from '../controllers/pagamentosController.js';

router.get('/', pagamentosController.getAllPagamentos);
router.get('/:id', pagamentosController.getPagamentoById);
router.post('/', pagamentosController.createPagamento);
router.put('/:id', pagamentosController.updatePagamento);
router.delete('/:id', pagamentosController.deletePagamento);

export default router;