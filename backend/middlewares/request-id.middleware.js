const crypto = require("crypto");

function adicionarRequestId(req, res, next) {
    const requestId = crypto.randomUUID();

    req.requestId = requestId;

    res.setHeader(
        "X-Request-Id",
        requestId
    );

    next();
}

module.exports = adicionarRequestId;