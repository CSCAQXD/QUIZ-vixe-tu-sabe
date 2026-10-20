const prisma = require("../config/prisma");

async function buscarRankingDeEscolas(ano) {
    return prisma.partida.groupBy({
        by: ["escolaId"],
        where: {
            ano,
        },
        _sum: {
            pontuacaoFinal: true,
        },
        _count: {
            id: true,
        },
        orderBy: {
            _sum: {
                pontuacaoFinal: "desc",
            },
        },
    });
}

async function buscarParticipacoes(ano, escolaId = null, categoriaQuiz = null, cliente = prisma) {
    return cliente.participacao.findMany({
        where: {
            partida: {
                ano,
                ...(categoriaQuiz ? { categoriaQuiz } : {}),
                ...(escolaId
                    ? {
                          escolaId,
                      }
                    : {}),
            },
        },
        select: {
            etapaEnsino: true,
            serie: true,
            turma: true,
            turmaBusca: true,
            cursoBusca: true,
            curso: {
                select: {
                    id: true,
                    nome: true,
                    nomeBusca: true,
                },
            },
            partida: {
                select: {
                    id: true,
                    pontuacaoFinal: true,
                    escola: {
                        select: {
                            id: true,
                            nome: true,
                            cidade: true,
                            cidadeUf: true,
                            municipioIbgeId: true,
                        },
                    },
                },
            },
        },
    });
}

async function buscarEscolasPorIds(ids) {
    if (ids.length === 0) {
        return [];
    }

    return prisma.escola.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        select: {
            id: true,
            nome: true,
            cidade: true,
            cidadeUf: true,
            municipioIbgeId: true,
        },
    });
}

async function buscarEscolaPorId(escolaId) {
    return prisma.escola.findUnique({
        where: {
            id: escolaId,
        },
        select: {
            id: true,
            nome: true,
            cidade: true,
            cidadeUf: true,
            municipioIbgeId: true,
        },
    });
}

module.exports = {
    buscarRankingDeEscolas,
    buscarParticipacoes,
    buscarEscolasPorIds,
    buscarEscolaPorId,
};
