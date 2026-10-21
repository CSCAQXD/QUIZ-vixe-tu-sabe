const express = require("express");
const cursoController = require("../controllers/curso.controller");
const limitarEscritas = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.get("/:escolaId/cursos", cursoController.listar);
router.post("/:escolaId/cursos", limitarEscritas, cursoController.cadastrar);

module.exports = router;
