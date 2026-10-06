const prisma = require("../config/prisma");

async function listarPorEscola(escolaId, cliente = prisma) {
    return cliente.curso.findMany({
        where: { escolaId },
        orderBy: { nome: "asc" },
    });
}

async function buscarPorNome(escolaId, nomeBusca, cliente = prisma) {
    return cliente.curso.findUnique({
        where: {
            escolaId_nomeBusca: { escolaId, nomeBusca },
        },
    });
}

async function criar(escolaId, nome, nomeBusca, cliente = prisma) {
    return cliente.curso.create({
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
