const express = require("express");

const rankingController = require(
    "../controllers/ranking.controller"
);

const router = express.Router();

router.get(
    "/ranking-turmas",
    rankingController
        .listarRankingDeTurmas
);

router.get(
    "/ranking-escolas",
    rankingController
        .listarRankingDeEscolas
);

router.get(
    "/ranking-interno/:escolaId",
    rankingController
        .listarRankingInterno
);

module.exports = router;