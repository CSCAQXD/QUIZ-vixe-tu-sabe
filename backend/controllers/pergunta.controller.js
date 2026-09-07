const perguntaService = require(
    "../services/pergunta.service"
);

async function listarPerguntas(
    req,
    res,
    next
) {
    try {
        const perguntas =
            await perguntaService
                .listarPerguntas();

        res.setHeader(
            "Cache-Control",
            "public, max-age=60"
        );

        return res.json({
            total:
                perguntas.length,
            perguntas,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listarPerguntas,
};