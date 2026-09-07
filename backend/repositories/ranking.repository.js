const prisma = require("../config/prisma");

async function buscarRankingDeTurmas() {
    return prisma.sessao.groupBy({
        by: ["escolaId", "serie", "turma"],
        _sum: {
        pontuacao: true,
        },
        orderBy: {
        _sum: {
            pontuacao: "desc",
        },
        },
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

async function buscarRankingInterno(escolaId) {
    return prisma.sessao.groupBy({
        by: ["serie", "turma"],
        where: {
        escolaId,
        },
        _sum: {
        pontuacao: true,
        },
        orderBy: {
        _sum: {
            pontuacao: "desc",
        },
        },
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