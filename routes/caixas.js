// src/routes/caixa.js
import { Router } from 'express';
const router = Router();
import * as caixaController from '../controllers/caixaController.js'

// listar caixas (opcional ?status=aberto)
router.get('/', caixaController.get);

// abrir caixa
router.post('/', caixaController.post);

// fechar caixa -> espera saldoFinal no body
router.patch('/:id', caixaController.fechar);

// obter por id
router.get('/:id', caixaController.getById);

export default router;
