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
                include: { curso: true },
                orderBy: [
                    {
                        etapaEnsino: "asc",
                    },
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
            categoriaQuiz: dados.categoriaQuiz,
            ano: dados.ano,
            escolaId: dados.escolaId,
            participacoes: {
                create: dados.turmas.map(
                    (turma) => ({
                        etapaEnsino:
                            turma.etapaEnsino,
                        serie: turma.serie,
                        turma: turma.turma,
                        cursoId: turma.cursoId,
                    })
                ),
            },
        },
        include: {
            escola: true,
            participacoes: {
                include: { curso: true },
                orderBy: [
                    {
                        etapaEnsino: "asc",
                    },
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
                include: { curso: true },
                orderBy: [
                    {
                        etapaEnsino: "asc",
                    },
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
                include: { curso: true },
                orderBy: [
                    {
                        etapaEnsino: "asc",
                    },
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
