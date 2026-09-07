const prisma = require("../config/prisma");

async function buscarTodas() {
    return prisma.escola.findMany({
        orderBy: {
        nome: "asc",
        },
    });
}

async function buscarPorNome(nome) {
    return prisma.escola.findUnique({
        where: {
        nome,
        },
    });
}

async function criar(dados) {
    return prisma.escola.create({
        data: dados,
    });
}

module.exports = {
    buscarTodas,
    buscarPorNome,
    criar,
};