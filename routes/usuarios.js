import { Router } from 'express';
const router = Router();
import * as usuariosController from '../controllers/usuariosController.js';

router.get('/', usuariosController.getAllUsuarios);
router.get('/:id', usuariosController.getUsuarioById);
router.post('/', usuariosController.createUsuario);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deleteUsuario);

export default router;
