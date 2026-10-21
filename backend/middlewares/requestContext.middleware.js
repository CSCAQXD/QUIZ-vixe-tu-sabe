const { randomUUID } = require("node:crypto");
const logger = require("../utils/logger");

const REQUEST_ID_VALIDO = /^[a-zA-Z0-9._:-]{1,100}$/;

function requestContext(req, res, next) {
    const recebido = req.get("X-Request-ID");
    const requestId = REQUEST_ID_VALIDO.test(recebido || "") ? recebido : randomUUID();
    const inicio = process.hrtime.bigint();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    res.on("finish", () => {
        if (process.env.NODE_ENV === "test") {
            return;
        }

        const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
        logger.info("http_request", {
            requestId,
            metodo: req.method,
            rota: req.originalUrl,
            status: res.statusCode,
            duracaoMs: Number(duracaoMs.toFixed(2)),
        });
    });

    return next();
}

module.exports = requestContext;
