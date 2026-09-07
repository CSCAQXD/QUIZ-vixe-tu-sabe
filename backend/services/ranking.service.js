const rankingRepository = require(
    "../repositories/ranking.repository"
);

function compararTexto(
    primeiro,
    segundo
) {
    return primeiro.localeCompare(
        segundo,
        "pt-BR",
        {
            sensitivity: "base",
        }
    );
}

function adicionarPosicoes(ranking) {
    let posicaoAnterior = 0;
    let pontuacaoAnterior = null;

    return ranking.map(
        (item, indice) => {
            if (
                item.pontuacaoTotal !==
                pontuacaoAnterior
            ) {
                posicaoAnterior =
                    indice + 1;

                pontuacaoAnterior =
                    item.pontuacaoTotal;
            }

            return {
                posicao:
                    posicaoAnterior,
                ...item,
            };
        }
    );
}

function aplicarLimite(
    ranking,
    limite
) {
    if (!limite) {
        return ranking;
    }

    return ranking.slice(
        0,
        limite
    );
}

function agruparParticipacoes(
    participacoes
) {
    const grupos = new Map();

    for (
        const participacao
        of participacoes
    ) {
        const escola =
            participacao.partida.escola;

        const chave = [
            escola.id,
            participacao.serie,
            participacao.turma,
        ].join("|||");

        const grupoExistente =
            grupos.get(chave);

        if (grupoExistente) {
            grupoExistente.pontuacaoTotal +=
                participacao.partida
                    .pontuacaoFinal;

            grupoExistente.quantidadePartidas +=
                1;

            continue;
        }

        grupos.set(chave, {
            escolaId: escola.id,
            escola: escola.nome,
            cidade: escola.cidade,
            serie:
                participacao.serie,
            turma:
                participacao.turma,
            pontuacaoTotal:
                participacao.partida
                    .pontuacaoFinal,
            quantidadePartidas: 1,
        });
    }

    return Array.from(
        grupos.values()
    );
}

function ordenarRankingDeTurmas(
    ranking
) {
    return ranking.sort(
        (primeiro, segundo) => {
            const diferencaPontos =
                segundo.pontuacaoTotal -
                primeiro.pontuacaoTotal;

            if (diferencaPontos !== 0) {
                return diferencaPontos;
            }

            const diferencaEscola =
                compararTexto(
                    primeiro.escola,
                    segundo.escola
                );

            if (diferencaEscola !== 0) {
                return diferencaEscola;
            }

            const diferencaSerie =
                primeiro.serie -
                segundo.serie;

            if (diferencaSerie !== 0) {
                return diferencaSerie;
            }

            return compararTexto(
                primeiro.turma,
                segundo.turma
            );
        }
    );
}

async function listarRankingDeTurmas(
    ano,
    limite
) {
    const participacoes =
        await rankingRepository.buscarParticipacoes(
            ano
        );

    const ranking =
        agruparParticipacoes(
            participacoes
        );

    ordenarRankingDeTurmas(
        ranking
    );

    return {
        ano,
        total: ranking.length,
        ranking: aplicarLimite(
            adicionarPosicoes(ranking),
            limite
        ),
    };
}

async function listarRankingDeEscolas(
    ano,
    limite
) {
    const agrupamento =
        await rankingRepository.buscarRankingDeEscolas(
            ano
        );

    const escolaIds =
        agrupamento.map(
            (item) => item.escolaId
        );

    const escolas =
        await rankingRepository.buscarEscolasPorIds(
            escolaIds
        );

    const escolasPorId =
        new Map(
            escolas.map(
                (escola) => [
                    escola.id,
                    escola,
                ]
            )
        );

    const ranking =
        agrupamento.map((item) => {
            const escola =
                escolasPorId.get(
                    item.escolaId
                );

            return {
                escolaId:
                    item.escolaId,
                escola:
                    escola?.nome ||
                    "Escola não encontrada",
                cidade:
                    escola?.cidade ||
                    "Cidade não encontrada",
                pontuacaoTotal:
                    item._sum
                        .pontuacaoFinal || 0,
                quantidadePartidas:
                    item._count.id,
            };
        });

    ranking.sort(
        (primeiro, segundo) => {
            const diferencaPontos =
                segundo.pontuacaoTotal -
                primeiro.pontuacaoTotal;

            if (diferencaPontos !== 0) {
                return diferencaPontos;
            }

            return compararTexto(
                primeiro.escola,
                segundo.escola
            );
        }
    );

    return {
        ano,
        total: ranking.length,
        ranking: aplicarLimite(
            adicionarPosicoes(ranking),
            limite
        ),
    };
}

async function listarRankingInterno(
    escolaId,
    ano,
    limite
) {
    const escola =
        await rankingRepository.buscarEscolaPorId(
            escolaId
        );

    if (!escola) {
        const erro = new Error(
            "Escola não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    const participacoes =
        await rankingRepository.buscarParticipacoes(
            ano,
            escolaId
        );

    const ranking =
        agruparParticipacoes(
            participacoes
        ).map((item) => ({
            serie: item.serie,
            turma: item.turma,
            pontuacaoTotal:
                item.pontuacaoTotal,
            quantidadePartidas:
                item.quantidadePartidas,
        }));

    ordenarRankingDeTurmas(
        ranking.map((item) => ({
            ...item,
            escola: escola.nome,
        }))
    );

    ranking.sort(
        (primeiro, segundo) => {
            const diferencaPontos =
                segundo.pontuacaoTotal -
                primeiro.pontuacaoTotal;

            if (diferencaPontos !== 0) {
                return diferencaPontos;
            }

            const diferencaSerie =
                primeiro.serie -
                segundo.serie;

            if (diferencaSerie !== 0) {
                return diferencaSerie;
            }

            return compararTexto(
                primeiro.turma,
                segundo.turma
            );
        }
    );

    return {
        ano,
        escola,
        total: ranking.length,
        ranking: aplicarLimite(
            adicionarPosicoes(ranking),
            limite
        ),
    };
}

module.exports = {
    listarRankingDeTurmas,
    listarRankingDeEscolas,
    listarRankingInterno,
};