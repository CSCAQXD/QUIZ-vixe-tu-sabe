const express = require("express");
const escolaController = require("../controllers/escola.controller");

const router = express.Router();

router.get("/", escolaController.listarEscolas);

module.exports = router;