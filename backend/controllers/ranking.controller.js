const rankingService = require(
    "../services/ranking.service"
);

function obterAno(req) {
    if (
        req.query.ano === undefined
    ) {
        return new Date()
            .getFullYear();
    }

    const ano = Number(
        req.query.ano
    );

    if (
        !Number.isInteger(ano) ||
        ano < 2000 ||
        ano > 2100
    ) {
        const erro = new Error(
            "ano deve ser um número inteiro entre 2000 e 2100."
        );

        erro.statusCode = 400;

        throw erro;
    }

    return ano;
}

function obterLimite(req) {
    if (
        req.query.limit === undefined
    ) {
        return null;
    }

    const limite = Number(
        req.query.limit
    );

    if (
        !Number.isInteger(limite) ||
        limite < 1 ||
        limite > 100
    ) {
        const erro = new Error(
            "limit deve ser um número inteiro entre 1 e 100."
        );

        erro.statusCode = 400;

        throw erro;
    }

    return limite;
}

async function listarRankingDeTurmas(
    req,
    res,
    next
) {
    try {
        const resultado =
            await rankingService.listarRankingDeTurmas(
                obterAno(req),
                obterLimite(req)
            );

        return res.json(resultado);
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
        const resultado =
            await rankingService.listarRankingDeEscolas(
                obterAno(req),
                obterLimite(req)
            );

        return res.json(resultado);
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
                req.params.escolaId,
                obterAno(req),
                obterLimite(req)
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