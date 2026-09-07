const prisma = require("../config/prisma");

async function buscarTodas() {
    return prisma.escola.findMany({
        orderBy: {
        nome: "asc",
        },
    });
}

async function buscarPorNomeECidade(nome, cidade) {
    return prisma.escola.findUnique({
        where: {
            nome_cidade: {
                nome,
                cidade,
            },
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
    buscarPorNomeECidade,
    criar,
};