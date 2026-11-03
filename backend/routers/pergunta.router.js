const express = require("express");

const perguntaController = require("../controllers/pergunta.controller");
const adminToken = require("../middlewares/adminToken.middleware");
const limitarEscritas = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.get("/", perguntaController.listarPerguntas);
router.get("/admin/status", adminToken, perguntaController.obterStatus);
router.post("/admin/validar", adminToken, limitarEscritas, perguntaController.validarAtualizacao);
router.post(
    "/admin/versoes/:id/ativar",
    adminToken,
    limitarEscritas,
    perguntaController.ativarVersao,
);

module.exports = router;
