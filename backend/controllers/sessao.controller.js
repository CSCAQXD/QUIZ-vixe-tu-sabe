const sessaoService = require("../services/sessao.service");

async function registrarSessoes(req, res, next) {
    try {
        const resultado = await sessaoService.registrarSessoes(req.body);

        return res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registrarSessoes,
};
