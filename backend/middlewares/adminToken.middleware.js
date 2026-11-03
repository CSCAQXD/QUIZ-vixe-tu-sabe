const { timingSafeEqual } = require("node:crypto");

function extrairToken(req) {
    const cabecalho = req.get("Authorization");
    if (cabecalho?.startsWith("Bearer ")) return cabecalho.slice(7).trim();
    return String(req.get("X-Admin-Token") || "").trim();
}

function adminToken(req, res, next) {
    const esperado = String(process.env.PERGUNTAS_ADMIN_TOKEN || "");

    if (esperado.length < 16) {
        const erro = new Error("A administração das perguntas não está configurada.");
        erro.statusCode = 503;
        return next(erro);
    }

    const recebido = extrairToken(req);
    const bufferEsperado = Buffer.from(esperado);
    const bufferRecebido = Buffer.from(recebido);
    const autorizado =
        bufferEsperado.length === bufferRecebido.length &&
        timingSafeEqual(bufferEsperado, bufferRecebido);

    if (!autorizado) {
        const erro = new Error("Token administrativo inválido.");
        erro.statusCode = 401;
        return next(erro);
    }

    return next();
}

module.exports = adminToken;
