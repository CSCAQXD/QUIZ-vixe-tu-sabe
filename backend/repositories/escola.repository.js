const prisma = require(
    "../config/prisma"
);
const { chaveEntidade } = require("../utils/sanitize");

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

    const legadas = await cliente.escola.findMany({
        where: { nomeBusca: null },
    });
    const legada = legadas.find((escola) =>
        chaveEntidade(escola.nome, true) === nomeBusca &&
        chaveEntidade(escola.cidade) === cidadeBusca
    );

    if (legada) {
        return cliente.escola.update({
            where: { id: legada.id },
            data: { nomeBusca, cidadeBusca },
        });
    }

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
