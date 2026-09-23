const prisma = require("../config/prisma");

async function listarPorEscola(escolaId) {
    return prisma.curso.findMany({
        where: { escolaId },
        orderBy: { nome: "asc" },
    });
}

async function buscarPorNome(escolaId, nomeBusca) {
    return prisma.curso.findUnique({
        where: {
            escolaId_nomeBusca: { escolaId, nomeBusca },
        },
    });
}

async function criar(escolaId, nome, nomeBusca) {
    return prisma.curso.create({
        data: { escolaId, nome, nomeBusca },
    });
}

async function buscarPorId(id) {
    return prisma.curso.findUnique({ where: { id } });
}

module.exports = {
    buscarPorId,
    buscarPorNome,
    criar,
    listarPorEscola,
};
