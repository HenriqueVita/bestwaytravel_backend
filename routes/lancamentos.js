// src/routes/lancamentos.js
import { Router } from 'express';
const router = Router();
import * as lancamentosController from '../controllers/lancamentosController.js'

// listar lancamentos (opcional: ?start=&end=&tipo=&status=)
router.get('/', lancamentosController.getAllLancamentos );

// buscar por id
router.get('/:id', lancamentosController.getLancamentosById);

// criar lançamento -> verifica se existe caixa aberto
router.post('/', lancamentosController.createLancamento);

// atualizar (patch)
router.patch('/:id', lancamentosController.updateLancamento);

// deletar
router.delete('/:id', lancamentosController.deleteLancamento );

export default router;
