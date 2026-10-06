const prisma = require(
    "../config/prisma"
);

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

async function buscarPorId(id) {
    return prisma.escola.findUnique({
        where: {
            id,
        },
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

async function buscarOuCriar(
    nome,
    cidade,
    nomeBusca,
    cidadeBusca,
    cliente = prisma
) {
    const existente = await cliente.escola.findFirst({
        where: {
            OR: [
                { nomeBusca, cidadeBusca },
                { nome, cidade },
            ],
        },
    });

    if (existente) return existente;

    return cliente.escola.create({
        data: {
            nome,
            cidade,
            nomeBusca,
            cidadeBusca,
        },
    });
}

module.exports = {
    buscarTodas,
    buscarPorId,
    buscarPorNomeECidade,
    buscarOuCriar,
};
