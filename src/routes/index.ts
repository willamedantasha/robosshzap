import { Router } from "express";
import { notificacaopix } from "../controllers/notificacaoController";

const router = Router();
router.post('/notificacoes', notificacaopix);

export default router;