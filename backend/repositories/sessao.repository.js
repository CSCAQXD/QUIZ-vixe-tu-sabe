const prisma = require("../config/prisma");

async function criar(dados) {
    return prisma.sessao.create({
        data: dados,
    });
}

async function buscarTodasDaEscola(escolaId) {
    return prisma.sessao.findMany({
        where: {
        escolaId,
        },
    });
}

module.exports = {
    criar,
    buscarTodasDaEscola,
};