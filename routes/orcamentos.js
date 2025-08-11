import { Router } from 'express';
const router = Router();
import * as orcamentosController from '../controllers/orcamentosController.js';

router.get('/', orcamentosController.getAllOrcamentos);
router.get('/:id', orcamentosController.getOrcamentoById);
router.post('/', orcamentosController.createOrcamento);
router.post('/:id/confirmar-venda', orcamentosController.confirmarVendaOrcamento);
router.post('/:id/confirmar-pagamento', orcamentosController.confirmarPagamentoOrcamento);
router.put('/:id', orcamentosController.updateOrcamento);
router.patch('/:id', orcamentosController.updateOrcamento);
router.delete('/:id', orcamentosController.deleteOrcamento);


export default router;
