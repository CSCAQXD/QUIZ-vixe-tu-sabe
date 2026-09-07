const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const sessaoRepository = require(
    "../repositories/sessao.repository"
);

const rankingService = require(
    "../services/ranking.service"
);

const sessaoService = require(
    "../services/sessao.service"
);

function criarPartida() {
    return {
        id: "partida-1",
        idempotencyKey:
            "550e8400-e29b-41d4-a716-446655440000",
        pontuacaoFinal: 100,
        ano: 2026,
        dataPartida:
            new Date(
                "2026-09-08T10:00:00.000Z"
            ),
        escola: {
            id: "escola-1",
            nome: "ESCOLA TESTE",
            cidade: "QUIXADÁ",
        },
        participacoes: [
            {
                id:
                    "participacao-1",
                serie: 9,
                turma: "A",
            },
        ],
    };
}

test.afterEach(() => {
    mock.restoreAll();
});

test(
    "não registra novamente uma partida com a mesma chave",
    async () => {
        const partida =
            criarPartida();

        const buscar =
            mock.method(
                sessaoRepository,
                "buscarPorIdempotencyKey",
                async () => partida
            );

        mock.method(
            rankingService,
            "listarRankingInterno",
            async () => ({
                total: 1,
                ranking: [
                    {
                        posicao: 1,
                        serie: 9,
                        turma: "A",
                        pontuacaoTotal:
                            100,
                    },
                ],
            })
        );

        const resultado =
            await sessaoService
                .registrarSessoes({
                    idempotencyKey:
                        partida
                            .idempotencyKey,
                    nomeEscola:
                        "Escola Teste",
                    cidade: "Quixadá",
                    pontuacaoFinal:
                        100,
                    turmas: [
                        {
                            serie: 9,
                            turma: "A",
                        },
                    ],
                });

        assert.equal(
            buscar.mock.callCount(),
            1
        );

        assert.equal(
            resultado.duplicada,
            true
        );

        assert.equal(
            resultado.partida.id,
            "partida-1"
        );
    }
);

test(
    "retorna a posição imediata da turma",
    async () => {
        const partida =
            criarPartida();

        mock.method(
            sessaoRepository,
            "buscarPorId",
            async () => partida
        );

        mock.method(
            rankingService,
            "listarRankingInterno",
            async () => ({
                total: 3,
                ranking: [
                    {
                        posicao: 1,
                        serie: 8,
                        turma: "A",
                        pontuacaoTotal:
                            200,
                    },
                    {
                        posicao: 2,
                        serie: 9,
                        turma: "A",
                        pontuacaoTotal:
                            100,
                    },
                    {
                        posicao: 3,
                        serie: 9,
                        turma: "B",
                        pontuacaoTotal:
                            80,
                    },
                ],
            })
        );

        const resultado =
            await sessaoService
                .buscarPartidaPorId(
                    "partida-1"
                );

        assert.equal(
            resultado.turmas[0]
                .posicaoRankingInterno,
            2
        );

        assert.equal(
            resultado.turmas[0]
                .pontuacaoAcumulada,
            100
        );

        assert.equal(
            resultado.turmas[0]
                .totalTurmasNoRankingInterno,
            3
        );
    }
);

test(
    "retorna erro ao consultar uma partida inexistente",
    async () => {
        mock.method(
            sessaoRepository,
            "buscarPorId",
            async () => null
        );

        await assert.rejects(
            () =>
                sessaoService
                    .buscarPartidaPorId(
                        "inexistente"
                    ),
            /Partida não encontrada/
        );
    }
);