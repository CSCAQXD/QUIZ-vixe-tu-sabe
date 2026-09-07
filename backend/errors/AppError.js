class AppError extends Error {
    constructor(
        mensagem,
        statusCode = 500,
        codigo = "ERRO_INTERNO",
        detalhes = undefined
    ) {
        super(mensagem);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.codigo = codigo;
        this.detalhes = detalhes;
        this.operacional = true;

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}

module.exports = AppError;