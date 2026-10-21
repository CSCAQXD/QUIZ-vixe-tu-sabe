const { rateLimit } = require("express-rate-limit");

function inteiroPositivo(valor, padrao) {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

function criarLimitadorEscritas(opcoes = {}) {
    return rateLimit({
        windowMs: inteiroPositivo(opcoes.windowMs, 60_000),
        limit: inteiroPositivo(opcoes.limit, 60),
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler(req, res) {
            return res.status(429).json({
                erro: "Muitas solicitações. Aguarde um momento e tente novamente.",
                requestId: req.requestId,
            });
        },
    });
}

const limitarEscritas = criarLimitadorEscritas({
    windowMs: process.env.WRITE_RATE_LIMIT_WINDOW_MS,
    limit: process.env.WRITE_RATE_LIMIT_MAX,
});

module.exports = limitarEscritas;
module.exports.criarLimitadorEscritas = criarLimitadorEscritas;
