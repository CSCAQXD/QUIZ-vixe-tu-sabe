const rankingService = require(
    "../services/ranking.service"
);

function obterLimit(req) {
    if (req.query.limit === undefined) {
        return null;
    }

    const limit = Number(req.query.limit);

    if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        const erro = new Error(
            "limit deve ser um número inteiro entre 1 e 100."
        );

        erro.statusCode = 400;

        throw erro;
    }

    return limit;
}

async function listarRankingDeTurmas(
    req,
    res,
    next
) {
    try {
        const ranking =
            await rankingService.listarRankingDeTurmas(
                obterLimit(req)
            );

        return res.json(ranking);
    } catch (error) {
        next(error);
    }
}

async function listarRankingDeEscolas(
    req,
    res,
    next
) {
    try {
        const ranking =
            await rankingService.listarRankingDeEscolas(
                obterLimit(req)
            );

        return res.json(ranking);
    } catch (error) {
        next(error);
    }
}

async function listarRankingInterno(
    req,
    res,
    next
) {
    try {
        const resultado =
            await rankingService.listarRankingInterno(
                req.params.escolaId
            );

        return res.json(resultado);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listarRankingDeTurmas,
    listarRankingDeEscolas,
    listarRankingInterno,
};