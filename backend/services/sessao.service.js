const prisma = require(
    "../config/prisma"
);

const escolaRepository = require(
    "../repositories/escola.repository"
);

const sessaoRepository = require(
    "../repositories/sessao.repository"
);

const rankingService = require(
    "./ranking.service"
);

const {
    limpar,
} = require("../utils/sanitize");

async function montarResultado(
    partida,
    duplicada = false
) {
    const rankingInterno =
        await rankingService.listarRankingInterno(
            partida.escola.id,
            partida.ano,
            null
        );

    const turmas =
        partida.participacoes.map(
            (participacao) => {
                const itemRanking =
                    rankingInterno.ranking.find(
                        (item) =>
                            item.serie ===
                                participacao.serie &&
                            item.turma ===
                                participacao.turma
                    );

                return {
                    id: participacao.id,
                    serie:
                        participacao.serie,
                    turma:
                        participacao.turma,
                    pontuacaoDaRodada:
                        partida.pontuacaoFinal,
                    pontuacaoAcumulada:
                        itemRanking
                            ?.pontuacaoTotal || 0,
                    posicaoRankingInterno:
                        itemRanking
                            ?.posicao || null,
                    totalTurmasNoRankingInterno:
                        rankingInterno.total,
                };
            }
        );

    return {
        mensagem: duplicada
            ? "Esta partida já havia sido registrada."
            : "Partida registrada com sucesso.",

        duplicada,

        partida: {
            id: partida.id,
            idempotencyKey:
                partida.idempotencyKey,
            pontuacaoFinal:
                partida.pontuacaoFinal,
            ano: partida.ano,
            dataPartida:
                partida.dataPartida,
        },

        escola: {
            id: partida.escola.id,
            nome: partida.escola.nome,
            cidade:
                partida.escola.cidade,
        },

        turmas,
    };
}

async function registrarSessoes(dados) {
    const partidaExistente =
        await sessaoRepository
            .buscarPorIdempotencyKey(
                dados.idempotencyKey
            );

    if (partidaExistente) {
        return montarResultado(
            partidaExistente,
            true
        );
    }

    const nomeEscola =
        limpar(dados.nomeEscola);

    const cidade =
        limpar(dados.cidade);

    const turmas =
        dados.turmas.map(
            (turma) => ({
                serie: turma.serie,
                turma: limpar(
                    turma.turma
                ),
            })
        );

    const anoAtual =
        new Date().getFullYear();

    try {
        const partida =
            await prisma.$transaction(
                async (transaction) => {
                    const escola =
                        await escolaRepository
                            .buscarOuCriar(
                                nomeEscola,
                                cidade,
                                transaction
                            );

                    return sessaoRepository
                        .criar(
                            {
                                idempotencyKey:
                                    dados.idempotencyKey,

                                pontuacaoFinal:
                                    dados.pontuacaoFinal,

                                ano: anoAtual,

                                escolaId:
                                    escola.id,

                                turmas,
                            },
                            transaction
                        );
                }
            );

        return montarResultado(
            partida
        );
    } catch (error) {
        if (error.code === "P2002") {
            const partidaDuplicada =
                await sessaoRepository
                    .buscarPorIdempotencyKey(
                        dados.idempotencyKey
                    );

            if (partidaDuplicada) {
                return montarResultado(
                    partidaDuplicada,
                    true
                );
            }
        }

        throw error;
    }
}

async function buscarPartidaPorId(id) {
    const partida =
        await sessaoRepository
            .buscarPorId(id);

    if (!partida) {
        const erro = new Error(
            "Partida não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    return montarResultado(
        partida
    );
}

async function listarPartidasPorEscola(
    escolaId,
    ano
) {
    const escola =
        await escolaRepository
            .buscarPorId(escolaId);

    if (!escola) {
        const erro = new Error(
            "Escola não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    const partidas =
        await sessaoRepository
            .listarPorEscola(
                escolaId,
                ano
            );

    const historico =
        partidas.map((partida) => ({
            id: partida.id,
            idempotencyKey:
                partida.idempotencyKey,
            pontuacaoFinal:
                partida.pontuacaoFinal,
            ano: partida.ano,
            dataPartida:
                partida.dataPartida,
            turmas:
                partida.participacoes.map(
                    (participacao) => ({
                        id:
                            participacao.id,
                        serie:
                            participacao.serie,
                        turma:
                            participacao.turma,
                    })
                ),
        }));

    return {
        escola,
        ano: ano || null,
        total: historico.length,
        partidas: historico,
    };
}

module.exports = {
    registrarSessoes,
    buscarPartidaPorId,
    listarPartidasPorEscola,
};