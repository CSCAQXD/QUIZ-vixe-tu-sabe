const prisma = require(
    "../config/prisma"
);

async function buscarPorIdempotencyKey(
    idempotencyKey,
    cliente = prisma
) {
    return cliente.partida.findUnique({
        where: {
            idempotencyKey,
        },
        include: {
            escola: true,
            participacoes: {
                orderBy: [
                    {
                        serie: "asc",
                    },
                    {
                        turma: "asc",
                    },
                ],
            },
        },
    });
}

async function criar(
    dados,
    cliente = prisma
) {
    return cliente.partida.create({
        data: {
            idempotencyKey:
                dados.idempotencyKey,
            pontuacaoFinal:
                dados.pontuacaoFinal,
            ano: dados.ano,
            escolaId: dados.escolaId,
            participacoes: {
                create: dados.turmas.map(
                    (turma) => ({
                        serie: turma.serie,
                        turma: turma.turma,
                    })
                ),
            },
        },
        include: {
            escola: true,
            participacoes: {
                orderBy: [
                    {
                        serie: "asc",
                    },
                    {
                        turma: "asc",
                    },
                ],
            },
        },
    });
}

async function buscarPorId(id) {
    return prisma.partida.findUnique({
        where: {
            id,
        },
        include: {
            escola: true,
            participacoes: {
                orderBy: [
                    {
                        serie: "asc",
                    },
                    {
                        turma: "asc",
                    },
                ],
            },
        },
    });
}

async function listarPorEscola(
    escolaId,
    ano
) {
    return prisma.partida.findMany({
        where: {
            escolaId,
            ...(ano
                ? {
                        ano,
                    }
                : {}),
        },
        include: {
            participacoes: {
                orderBy: [
                    {
                        serie: "asc",
                    },
                    {
                        turma: "asc",
                    },
                ],
            },
        },
        orderBy: {
            dataPartida: "desc",
        },
    });
}

module.exports = {
    buscarPorIdempotencyKey,
    criar,
    buscarPorId,
    listarPorEscola,
};