const perguntaService = require("../services/pergunta.service");

async function listarPerguntas(req, res, next) {
    try {
        const perguntas = await perguntaService.listarPerguntas();

        return res.json(perguntas);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listarPerguntas,
};
