const perguntaRepository = require("../repositories/pergunta.repository");
const { normalizarFaixaPergunta, obterMenorFaixa } = require("../utils/faixaEnsino");

const CACHE_TTL_PADRAO = 5 * 60 * 1000;

let cache = null;
let cacheExpiraEm = 0;
let buscaEmAndamento = null;

function obterCacheTtl() {
    const valor = Number(process.env.PERGUNTAS_CACHE_TTL_MS);

    if (Number.isInteger(valor) && valor >= 1000) {
        return valor;
    }

    return CACHE_TTL_PADRAO;
}

function normalizarTexto(valor) {
    return String(valor ?? "").trim();
}

function normalizarPergunta(pergunta, indice) {
    const id = normalizarTexto(pergunta.id) || `PERGUNTA-${indice + 1}`;

    const enunciado = normalizarTexto(pergunta.pergunta);

    const tema = normalizarTexto(pergunta.tema);

    const opcoes = [pergunta.altA, pergunta.altB, pergunta.altC, pergunta.altD].map(
        normalizarTexto,
    );

    const correta = normalizarTexto(pergunta.correta);

    const pontosIniciais = Number(pergunta.pontosIniciais);

    const faixa = normalizarFaixaPergunta(pergunta.faixa);

    const dicas = [pergunta.dica1, pergunta.dica2, pergunta.dica3]
        .map(normalizarTexto)
        .filter(Boolean);

    if (!enunciado) {
        return null;
    }

    if (opcoes.some((opcao) => !opcao)) {
        return null;
    }

    if (!correta) {
        return null;
    }

    if (!faixa) {
        return null;
    }

    if (!Number.isInteger(pontosIniciais) || pontosIniciais < 0) {
        return null;
    }

    return {
        id,
        faixa,
        tema,
        pergunta: enunciado,
        opcoes,
        correta,
        pontosIniciais,
        dicas: dicas.slice(0, 3),
    };
}

function transformarPerguntas(dados) {
    const perguntas = dados.map(normalizarPergunta).filter(Boolean);

    if (perguntas.length === 0) {
        const erro = new Error("Nenhuma pergunta válida foi encontrada na planilha.");

        erro.statusCode = 502;

        throw erro;
    }

    const ids = new Set();

    for (const pergunta of perguntas) {
        if (ids.has(pergunta.id)) {
            const erro = new Error(`A planilha possui o ID duplicado: ${pergunta.id}.`);

            erro.statusCode = 502;

            throw erro;
        }

        ids.add(pergunta.id);
    }

    return perguntas;
}

async function atualizarCache() {
    const dados = await perguntaRepository.buscarDaPlanilha();

    const perguntas = transformarPerguntas(dados);

    cache = perguntas;

    cacheExpiraEm = Date.now() + obterCacheTtl();

    return cache;
}

async function listarPerguntas(turmas = []) {
    const cacheValido = cache && Date.now() < cacheExpiraEm;

    if (cacheValido) {
        return filtrarPorTurmas(cache, turmas);
    }

    if (buscaEmAndamento) {
        const perguntas = await buscaEmAndamento;
        return filtrarPorTurmas(perguntas, turmas);
    }

    buscaEmAndamento = atualizarCache();

    try {
        const perguntas = await buscaEmAndamento;
        return filtrarPorTurmas(perguntas, turmas);
    } catch (error) {
        if (cache) {
            return filtrarPorTurmas(cache, turmas);
        }

        throw error;
    } finally {
        buscaEmAndamento = null;
    }
}

function filtrarPorTurmas(perguntas, turmas) {
    const faixa = obterMenorFaixa(turmas);

    if (!faixa) return omitirFaixa(perguntas);

    const filtradas = perguntas.filter((pergunta) => ["TODAS", faixa].includes(pergunta.faixa));

    if (filtradas.length === 0) {
        const erro = new Error("Nenhuma pergunta disponível para esta faixa de ensino.");
        erro.statusCode = 404;
        throw erro;
    }

    return omitirFaixa(filtradas);
}

function omitirFaixa(perguntas) {
    return perguntas.map(({ faixa, ...pergunta }) => pergunta);
}

function limparCache() {
    cache = null;
    cacheExpiraEm = 0;
    buscaEmAndamento = null;
}

module.exports = {
    listarPerguntas,
    limparCache,
};
