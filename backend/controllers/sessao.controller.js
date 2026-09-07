const sessaoService = require("../services/sessao.service");

async function registrarSessoes(req, res, next) {
    try {
        const resultado = await sessaoService.registrarSessoes(req.body);

        return res.status(201).json(resultado);
    } catch (error) {
        if (error.statusCode) {
        return res.status(error.statusCode).json({
            erro: error.message,
        });
        }

        next(error);
    }
}

module.exports = {
    registrarSessoes,
};