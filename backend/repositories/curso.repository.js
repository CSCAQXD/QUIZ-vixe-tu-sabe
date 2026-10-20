const prisma = require("../config/prisma");
const { cursosSaoEquivalentes } = require("../utils/identidadeCadastro");

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

async function buscarEquivalente(escolaId, nomeBusca, cliente = prisma) {
    const exato = await buscarPorNome(escolaId, nomeBusca, cliente);
    if (exato) return exato;

    const cursos = await listarPorEscola(escolaId, cliente);
    return cursos.find(
        (curso) => cursosSaoEquivalentes(
            curso.nomeBusca || curso.nome,
            nomeBusca
        )
    ) || null;
}

async function criar(escolaId, nome, nomeBusca, cliente = prisma) {
    return cliente.curso.upsert({
        where: {
            escolaId_nomeBusca: { escolaId, nomeBusca },
        },
        update: {},
        create: { escolaId, nome, nomeBusca },
    });
}

async function buscarPorId(id) {
    return prisma.curso.findUnique({ where: { id } });
}

module.exports = {
    buscarPorId,
    buscarEquivalente,
    buscarPorNome,
    criar,
    listarPorEscola,
};
