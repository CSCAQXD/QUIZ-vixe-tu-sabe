const express = require("express");

const perguntaController = require("../controllers/pergunta.controller");
const adminToken = require("../middlewares/adminToken.middleware");
const limitarEscritas = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.get("/", perguntaController.listarPerguntas);
router.get("/admin/status", adminToken, perguntaController.obterStatus);
router.get("/admin/versoes/:id", adminToken, perguntaController.detalharVersao);
router.post(
    "/admin/validar-arquivo",
    adminToken,
    limitarEscritas,
    express.text({ type: ["text/csv", "text/plain"], limit: "2mb" }),
    perguntaController.validarArquivo,
);
router.delete(
    "/admin/versoes/:id",
    adminToken,
    limitarEscritas,
    perguntaController.descartarVersao,
);
router.post(
    "/admin/versoes/:id/ativar",
    adminToken,
    limitarEscritas,
    perguntaController.ativarVersao,
);

module.exports = router;
