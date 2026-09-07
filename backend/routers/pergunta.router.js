const express = require("express");

const perguntaController = require(
    "../controllers/pergunta.controller"
);

const router = express.Router();

router.get(
    "/",
    perguntaController.listarPerguntas
);

module.exports = router;