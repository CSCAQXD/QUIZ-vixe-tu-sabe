const cursoRepository = require("../repositories/curso.repository");
const escolaRepository = require("../repositories/escola.repository");
const {
    buscarCursosCatalogoEquivalentes,
    cursosSaoEquivalentes,
    obterIdentidadeCurso,
} = require("../utils/identidadeCadastro");

function normalizar(nome) {
    return obterIdentidadeCurso(nome);
}

function encontrarSemelhante(cursos, nomeBusca) {
    const termos = nomeBusca.split(" ").filter((termo) => termo.length > 2);
    return cursos.find(
        (curso) =>
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
    const nomeInformado = String(nome ?? "")
        .trim()
        .replace(/\s+/g, " ");
    const cursosCatalogo = buscarCursosCatalogoEquivalentes(nomeInformado);
    const nomeLimpo = nomeInformado;
    if (cursosCatalogo.length > 1) {
        const erro = new Error(
            "O nome informado pode representar mais de um curso. Selecione uma opção da lista ou escreva o nome completo.",
        );
        erro.statusCode = 409;
        erro.sugestoes = cursosCatalogo;
        throw erro;
    }
    if ((nomeInformado.length < 3 && cursosCatalogo.length !== 1) || nomeLimpo.length > 120) {
        const erro = new Error(
            "O curso deve possuir entre 3 e 120 caracteres ou ser uma sigla reconhecida da lista.",
        );
        erro.statusCode = 400;
        throw erro;
    }
    const cursos = await listar(escolaId);
    const nomeBusca = normalizar(nomeLimpo);
    const existente = cursos.find((curso) =>
        cursosSaoEquivalentes(curso.nomeBusca || curso.nome, nomeBusca),
    );
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

async function resolver(escolaId, nome, cliente) {
    const nomeLimpo = String(nome ?? "")
        .trim()
        .replace(/\s+/g, " ");
    const nomeBusca = normalizar(nomeLimpo);
    const existente = await cursoRepository.buscarEquivalente(escolaId, nomeBusca, cliente);

    if (existente) return existente;

    return cursoRepository.criar(escolaId, nomeLimpo, nomeBusca, cliente);
}

module.exports = { cadastrar, listar, normalizar, resolver };
