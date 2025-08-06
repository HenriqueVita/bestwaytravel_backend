import { Router } from 'express';
const router = Router();
import * as clienteController from '../controllers/clientesController.js';

router.get('/', clienteController.getAllClientes);
router.get('/:id', clienteController.getClienteById);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

export default router;