const crypto = require("crypto");

const prisma = require("../config/prisma");
const escolaRepository = require(
    "../repositories/escola.repository"
);
const sessaoRepository = require(
    "../repositories/sessao.repository"
);
const rankingRepository = require(
    "../repositories/ranking.repository"
);

const { limpar } = require("../utils/sanitize");

async function registrarSessoes(dados) {
    const pontuacaoFinal = Math.max(
        0,
        Math.round(
            dados.pontuacaoFinal ??
                dados.pontuacaoOriginal *
                    (1 - dados.dicasUsadas * 0.2)
        )
    );

    const grupoId = crypto.randomUUID();

    const turmasTratadas = dados.turmas.map(
        (turma) => ({
            serie: turma.serie,
            turma: limpar(turma.turma),
        })
    );

    const resultado = await prisma.$transaction(
        async (transaction) => {
            const escola =
                await escolaRepository.buscarOuCriar(
                    limpar(dados.nomeEscola),
                    limpar(dados.cidade),
                    transaction
                );

            await sessaoRepository.criarMuitas(
                turmasTratadas.map((turma) => ({
                    ...turma,
                    escolaId: escola.id,
                    pontuacao: pontuacaoFinal,
                    dicasUsadas: dados.dicasUsadas,
                    grupoId,
                })),
                transaction
            );

            const ranking =
                await rankingRepository.buscarRankingInterno(
                    escola.id,
                    transaction
                );

            return {
                escola,
                ranking,
            };
        }
    );

    const rankingInterno = resultado.ranking.map(
        (item) => ({
            serie: item.serie,
            turma: item.turma,
            pontuacaoTotal:
                item._sum.pontuacao || 0,
        })
    );

    const turmasResultado = turmasTratadas.map(
        (turma) => {
            const indice = rankingInterno.findIndex(
                (item) =>
                    item.serie === turma.serie &&
                    item.turma === turma.turma
            );

            const itemRanking =
                rankingInterno[indice];

            return {
                serie: turma.serie,
                turma: turma.turma,
                pontuacaoDaRodada:
                    pontuacaoFinal,
                pontuacaoAcumuladaNaEscola:
                    itemRanking.pontuacaoTotal,
                posicaoRankingInterno:
                    indice + 1,
                totalTurmasNoRankingInterno:
                    rankingInterno.length,
            };
        }
    );

    return {
        mensagem:
            "Sessão(ões) registrada(s) com sucesso!",
        escola: {
            id: resultado.escola.id,
            nome: resultado.escola.nome,
            cidade: resultado.escola.cidade,
        },
        grupoId,
        turmas: turmasResultado,
    };
}

module.exports = {
    registrarSessoes,
};