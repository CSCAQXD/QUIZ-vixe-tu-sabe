function tratarErroPrisma(error) {
    if (error.code === "P2002") {
        return {
            statusCode: 409,
            mensagem:
                "Já existe um registro com os dados informados.",
        };
    }

    if (error.code === "P2003") {
        return {
            statusCode: 409,
            mensagem:
                "A operação viola um relacionamento do banco de dados.",
        };
    }

    if (error.code === "P2025") {
        return {
            statusCode: 404,
            mensagem:
                "O registro solicitado não foi encontrado.",
        };
    }

    return null;
}

function errorMiddleware(
    error,
    req,
    res,
    next
) {
    if (res.headersSent) {
        return next(error);
    }

    const erroPrisma =
        tratarErroPrisma(error);

    const jsonInvalido =
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error;

    const statusCode =
        erroPrisma?.statusCode ||
        (jsonInvalido
            ? 400
            : error.statusCode) ||
        500;

    let mensagem;

    if (erroPrisma) {
        mensagem =
            erroPrisma.mensagem;
    } else if (jsonInvalido) {
        mensagem =
            "O corpo da requisição contém um JSON inválido.";
    } else if (
        statusCode >= 500 &&
        process.env.NODE_ENV ===
            "production"
    ) {
        mensagem =
            "Erro interno do servidor.";
    } else {
        mensagem =
            error.message ||
            "Erro interno do servidor.";
    }

    if (statusCode >= 500) {
        console.error({
            metodo: req.method,
            rota: req.originalUrl,
            mensagem:
                error.message,
            stack: error.stack,
        });
    }

    return res
        .status(statusCode)
        .json({
            erro: mensagem,
        });
}

module.exports =
    errorMiddleware;