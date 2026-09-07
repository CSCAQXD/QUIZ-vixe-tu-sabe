const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const rankingRepository = require(
    "../repositories/ranking.repository"
);

const rankingService = require(
    "../services/ranking.service"
);

test.afterEach(() => {
    mock.restoreAll();
});

test(
    "contabiliza uma partida compartilhada apenas uma vez para a escola",
    async () => {
        mock.method(
            rankingRepository,
            "buscarRankingDeEscolas",
            async () => [
                {
                    escolaId:
                        "escola-1",
                    _sum: {
                        pontuacaoFinal:
                            100,
                    },
                    _count: {
                        id: 1,
                    },
                },
            ]
        );

        mock.method(
            rankingRepository,
            "buscarEscolasPorIds",
            async () => [
                {
                    id: "escola-1",
                    nome:
                        "ESCOLA TESTE",
                    cidade: "QUIXADÁ",
                },
            ]
        );

        const resultado =
            await rankingService
                .listarRankingDeEscolas(
                    2026,
                    null
                );

        assert.equal(
            resultado.ranking.length,
            1
        );

        assert.equal(
            resultado.ranking[0]
                .pontuacaoTotal,
            100
        );

        assert.equal(
            resultado.ranking[0]
                .quantidadePartidas,
            1
        );
    }
);

test(
    "atribui a pontuação integral para todas as turmas da partida compartilhada",
    async () => {
        const partida = {
            id: "partida-1",
            pontuacaoFinal: 100,
            escola: {
                id: "escola-1",
                nome:
                    "ESCOLA TESTE",
                cidade: "QUIXADÁ",
            },
        };

        mock.method(
            rankingRepository,
            "buscarParticipacoes",
            async () => [
                {
                    serie: 9,
                    turma: "A",
                    partida,
                },
                {
                    serie: 9,
                    turma: "B",
                    partida,
                },
            ]
        );

        const resultado =
            await rankingService
                .listarRankingDeTurmas(
                    2026,
                    null
                );

        assert.equal(
            resultado.ranking.length,
            2
        );

        assert.equal(
            resultado.ranking[0]
                .pontuacaoTotal,
            100
        );

        assert.equal(
            resultado.ranking[1]
                .pontuacaoTotal,
            100
        );
    }
);

test(
    "soma as pontuações acumuladas da mesma turma",
    async () => {
        const escola = {
            id: "escola-1",
            nome: "ESCOLA TESTE",
            cidade: "QUIXADÁ",
        };

        mock.method(
            rankingRepository,
            "buscarParticipacoes",
            async () => [
                {
                    serie: 9,
                    turma: "A",
                    partida: {
                        id: "partida-1",
                        pontuacaoFinal:
                            100,
                        escola,
                    },
                },
                {
                    serie: 9,
                    turma: "A",
                    partida: {
                        id: "partida-2",
                        pontuacaoFinal:
                            80,
                        escola,
                    },
                },
            ]
        );

        const resultado =
            await rankingService
                .listarRankingDeTurmas(
                    2026,
                    null
                );

        assert.equal(
            resultado.ranking.length,
            1
        );

        assert.equal(
            resultado.ranking[0]
                .pontuacaoTotal,
            180
        );

        assert.equal(
            resultado.ranking[0]
                .quantidadePartidas,
            2
        );
    }
);

test(
    "atribui a mesma posição para pontuações empatadas",
    async () => {
        const escola = {
            id: "escola-1",
            nome: "ESCOLA TESTE",
            cidade: "QUIXADÁ",
        };

        mock.method(
            rankingRepository,
            "buscarParticipacoes",
            async () => [
                {
                    serie: 9,
                    turma: "A",
                    partida: {
                        id: "partida-1",
                        pontuacaoFinal:
                            100,
                        escola,
                    },
                },
                {
                    serie: 9,
                    turma: "B",
                    partida: {
                        id: "partida-2",
                        pontuacaoFinal:
                            100,
                        escola,
                    },
                },
                {
                    serie: 9,
                    turma: "C",
                    partida: {
                        id: "partida-3",
                        pontuacaoFinal:
                            80,
                        escola,
                    },
                },
            ]
        );

        const resultado =
            await rankingService
                .listarRankingDeTurmas(
                    2026,
                    null
                );

        assert.deepEqual(
            resultado.ranking.map(
                (item) => item.posicao
            ),
            [1, 1, 3]
        );
    }
);

test(
    "aplica o limite sem alterar o total do ranking",
    async () => {
        const escola = {
            id: "escola-1",
            nome: "ESCOLA TESTE",
            cidade: "QUIXADÁ",
        };

        mock.method(
            rankingRepository,
            "buscarParticipacoes",
            async () => [
                {
                    serie: 9,
                    turma: "A",
                    partida: {
                        id: "partida-1",
                        pontuacaoFinal:
                            100,
                        escola,
                    },
                },
                {
                    serie: 9,
                    turma: "B",
                    partida: {
                        id: "partida-2",
                        pontuacaoFinal:
                            80,
                        escola,
                    },
                },
            ]
        );

        const resultado =
            await rankingService
                .listarRankingDeTurmas(
                    2026,
                    1
                );

        assert.equal(
            resultado.total,
            2
        );

        assert.equal(
            resultado.ranking.length,
            1
        );
    }
);

test(
    "retorna erro quando a escola do ranking interno não existe",
    async () => {
        mock.method(
            rankingRepository,
            "buscarEscolaPorId",
            async () => null
        );

        await assert.rejects(
            () =>
                rankingService
                    .listarRankingInterno(
                        "inexistente",
                        2026,
                        null
                    ),
            /Escola não encontrada/
        );
    }
);