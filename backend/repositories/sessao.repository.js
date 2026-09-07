const prisma = require("../config/prisma");

async function criar(
    dados,
    cliente = prisma
) {
    return cliente.sessao.create({
        data: dados,
    });
}

async function criarMuitas(
    dados,
    cliente = prisma
) {
    return cliente.sessao.createMany({
        data: dados,
    });
}

async function buscarTodasDaEscola(
    escolaId,
    cliente = prisma
) {
    return cliente.sessao.findMany({
        where: {
            escolaId,
        },
    });
}

module.exports = {
    criar,
    criarMuitas,
    buscarTodasDaEscola,
};