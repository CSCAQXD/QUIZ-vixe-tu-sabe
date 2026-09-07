const rankingService = require("../services/ranking.service");

function obterLimit(req) {
    return req.query.limit ? parseInt(req.query.limit) : null;
}

async function listarRankingDeTurmas(req, res, next) {
    try {
        const ranking = await rankingService.listarRankingDeTurmas(
            obterLimit(req)
        );

        return res.json(ranking);
    } catch (error) {
        next(error);
    }
}

async function listarRankingDeEscolas(req, res, next) {
    try {
        const ranking = await rankingService.listarRankingDeEscolas(
            obterLimit(req)
        );

        return res.json(ranking);
    } catch (error) {
        next(error);
    }
}

async function listarRankingInterno(req, res, next) {
    try {
        const { escolaId } = req.params;

        const resultado = await rankingService.listarRankingInterno(
            escolaId
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
