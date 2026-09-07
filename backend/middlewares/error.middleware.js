function errorMiddleware(
    error,
    req,
    res,
    next
) {
    const statusCode =
        error.statusCode || 500;

    if (statusCode >= 500) {
        console.error(error);
    }

    const mensagem =
        statusCode >= 500 &&
        process.env.NODE_ENV === "production"
            ? "Erro interno do servidor."
            : error.message ||
                "Erro interno do servidor.";

    return res.status(statusCode).json({
        erro: mensagem,
    });
}

module.exports = errorMiddleware;