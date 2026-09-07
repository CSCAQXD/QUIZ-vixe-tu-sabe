const perguntaService = require("../services/pergunta.service");

async function listarPerguntas(req, res, next) {
    try {
        const perguntas = await perguntaService.listarPerguntas();

        return res.json(perguntas);
    } catch (error) {
        if (error.statusCode) {
        return res.status(error.statusCode).json({
            mensagem: error.message,
        });
        }

        next(error);
    }
}

module.exports = {
    listarPerguntas,
};