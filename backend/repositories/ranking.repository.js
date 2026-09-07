const prisma = require("../config/prisma");

async function buscarRankingDeTurmas() {
    return prisma.sessao.groupBy({
        by: [
            "escolaId",
            "serie",
            "turma",
        ],
        _sum: {
            pontuacao: true,
        },
        orderBy: [
            {
                _sum: {
                    pontuacao: "desc",
                },
            },
            {
                serie: "asc",
            },
            {
                turma: "asc",
            },
        ],
    });
}

async function buscarSessoesParaRankingDeEscolas() {
    return prisma.sessao.findMany({
        select: {
            escolaId: true,
            grupoId: true,
            pontuacao: true,
        },
    });
}

async function buscarRankingInterno(
    escolaId,
    cliente = prisma
) {
    return cliente.sessao.groupBy({
        by: [
            "serie",
            "turma",
        ],
        where: {
            escolaId,
        },
        _sum: {
            pontuacao: true,
        },
        orderBy: [
            {
                _sum: {
                    pontuacao: "desc",
                },
            },
            {
                serie: "asc",
            },
            {
                turma: "asc",
            },
        ],
    });
}

async function buscarEscolas() {
    return prisma.escola.findMany();
}

async function buscarEscolaPorId(escolaId) {
    return prisma.escola.findUnique({
        where: {
            id: escolaId,
        },
    });
}

module.exports = {
    buscarRankingDeTurmas,
    buscarSessoesParaRankingDeEscolas,
    buscarRankingInterno,
    buscarEscolas,
    buscarEscolaPorId,
};