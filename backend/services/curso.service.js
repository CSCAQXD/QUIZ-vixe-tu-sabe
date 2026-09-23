const cursoRepository = require("../repositories/curso.repository");
const escolaRepository = require("../repositories/escola.repository");

function normalizar(nome) {
    return String(nome ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function encontrarSemelhante(cursos, nomeBusca) {
    const termos = nomeBusca.split(" ").filter((termo) => termo.length > 2);
    return cursos.find((curso) =>
        curso.nomeBusca.includes(nomeBusca) ||
        nomeBusca.includes(curso.nomeBusca) ||
        termos.some((termo) => curso.nomeBusca.includes(termo)),
    );
}

async function listar(escolaId) {
    const escola = await escolaRepository.buscarPorId(escolaId);
    if (!escola) {
        const erro = new Error("Escola não encontrada.");
        erro.statusCode = 404;
        throw erro;
    }
    return cursoRepository.listarPorEscola(escolaId);
}

async function cadastrar(escolaId, nome, confirmar = false) {
    const nomeLimpo = String(nome ?? "").trim().replace(/\s+/g, " ");
    if (nomeLimpo.length < 3 || nomeLimpo.length > 120) {
        const erro = new Error("O curso deve possuir entre 3 e 120 caracteres.");
        erro.statusCode = 400;
        throw erro;
    }
    const cursos = await listar(escolaId);
    const nomeBusca = normalizar(nomeLimpo);
    const existente = cursos.find((curso) => curso.nomeBusca === nomeBusca);
    if (existente) return existente;
    const semelhante = encontrarSemelhante(cursos, nomeBusca);
    if (semelhante && !confirmar) {
        const erro = new Error(`Você quis dizer “${semelhante.nome}”?`);
        erro.statusCode = 409;
        erro.sugestao = semelhante;
        throw erro;
    }
    return cursoRepository.criar(escolaId, nomeLimpo, nomeBusca);
}

module.exports = { cadastrar, listar, normalizar };
