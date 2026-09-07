const prisma = require(
    "../config/prisma"
);

async function buscarRankingDeEscolas(
    ano
) {
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

async function buscarParticipacoes(
    ano,
    escolaId = null
) {
    return prisma.participacao.findMany({
        where: {
            partida: {
                ano,
                ...(escolaId
                    ? {
                            escolaId,
                        }
                    : {}),
            },
        },
        select: {
            serie: true,
            turma: true,
            partida: {
                select: {
                    id: true,
                    pontuacaoFinal: true,
                    escola: {
                        select: {
                            id: true,
                            nome: true,
                            cidade: true,
                        },
                    },
                },
            },
        },
    });
}

async function buscarEscolasPorIds(
    ids
) {
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
        },
    });
}

async function buscarEscolaPorId(
    escolaId
) {
    return prisma.escola.findUnique({
        where: {
            id: escolaId,
        },
        select: {
            id: true,
            nome: true,
            cidade: true,
        },
    });
}

module.exports = {
    buscarRankingDeEscolas,
    buscarParticipacoes,
    buscarEscolasPorIds,
    buscarEscolaPorId,
};