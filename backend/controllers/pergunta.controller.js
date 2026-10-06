const perguntaService = require(
    "../services/pergunta.service"
);

async function listarPerguntas(req, res, next) {
    try {
        const turmas = lerTurmas(req.query.turma);
        const perguntas =
            await perguntaService.listarPerguntas(turmas);

        res.setHeader(
            "Cache-Control",
            "public, max-age=60"
        );

        return res.status(200).json({
            total: perguntas.length,
            perguntas,
        });
    } catch (error) {
        next(error);
    }
}

function lerTurmas(parametro) {
    if (!parametro) return [];

    const valores = Array.isArray(parametro)
        ? parametro
        : [parametro];

    return valores.map((valor) => {
        const [etapaEnsino, serieTexto] = String(valor).split(":");
        const serie = Number(serieTexto);
        const limite = etapaEnsino === "MEDIO" ? 3 : 9;

        if (
            !["FUNDAMENTAL", "MEDIO"].includes(etapaEnsino) ||
            !Number.isInteger(serie) ||
            serie < 1 ||
            serie > limite
        ) {
            const erro = new Error("A turma informada é inválida.");
            erro.statusCode = 400;
            throw erro;
        }

        return { etapaEnsino, serie };
    });
}

module.exports = {
    listarPerguntas,
};
