const express = require("express");
const cursoController = require("../controllers/curso.controller");

const router = express.Router();

router.get("/:escolaId/cursos", cursoController.listar);
router.post("/:escolaId/cursos", cursoController.cadastrar);

module.exports = router;
