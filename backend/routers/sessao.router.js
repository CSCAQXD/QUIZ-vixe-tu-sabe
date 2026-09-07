const express = require("express");

const sessaoController = require("../controllers/sessao.controller");
const validar = require("../middlewares/validation.middleware");
const { validarSessao } = require("../schemas/sessao.schema");

const router = express.Router();

router.post(
    "/",
    validar(validarSessao),
    sessaoController.registrarSessoes
);

module.exports = router;