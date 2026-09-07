const express = require("express");
const sessaoController = require("../controllers/sessao.controller");

const router = express.Router();

router.post("/", sessaoController.registrarSessoes);

module.exports = router;