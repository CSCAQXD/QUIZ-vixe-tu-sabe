const escolaService = require("../services/escola.service");

async function listarEscolas(req, res, next) {
    try {
        const escolas = await escolaService.listarEscolas();

        return res.json(escolas);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listarEscolas,
};