const express = require("express");

const administracaoController = require("../controllers/administracao.controller");
const adminToken = require("../middlewares/adminToken.middleware");
const limitarEscritas = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.get("/rankings/exportar", adminToken, administracaoController.exportarRankings);
router.post(
    "/rankings/reiniciar",
    adminToken,
    limitarEscritas,
    administracaoController.reiniciarRankings,
);

module.exports = router;
