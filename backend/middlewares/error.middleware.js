function errorMiddleware(error, req, res, next) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        erro: error.message || "Erro interno do servidor.",
    });
}

module.exports = errorMiddleware;
