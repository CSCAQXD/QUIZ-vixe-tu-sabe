const prisma = require("../config/prisma");

async function buscarTodas() {
    return prisma.escola.findMany({
        orderBy: [
            {
                nome: "asc",
            },
            {
                cidade: "asc",
            },
        ],
    });
}

async function buscarPorNomeECidade(
    nome,
    cidade,
    cliente = prisma
) {
    return cliente.escola.findUnique({
        where: {
            nome_cidade: {
                nome,
                cidade,
            },
        },
    });
}

async function criar(
    dados,
    cliente = prisma
) {
    return cliente.escola.create({
        data: dados,
    });
}

async function buscarOuCriar(
    nome,
    cidade,
    cliente = prisma
) {
    return cliente.escola.upsert({
        where: {
            nome_cidade: {
                nome,
                cidade,
            },
        },
        update: {},
        create: {
            nome,
            cidade,
        },
    });
}

module.exports = {
    buscarTodas,
    buscarPorNomeECidade,
    criar,
    buscarOuCriar,
};