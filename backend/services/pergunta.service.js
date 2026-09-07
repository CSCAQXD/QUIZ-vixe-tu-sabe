const perguntaRepository = require(
    "../repositories/pergunta.repository"
);

const CACHE_TTL_PADRAO =
    5 * 60 * 1000;

let cache = null;
let cacheExpiraEm = 0;
let buscaEmAndamento = null;

function obterCacheTtl() {
    const valor = Number(
        process.env
            .PERGUNTAS_CACHE_TTL_MS
    );

    if (
        Number.isInteger(valor) &&
        valor >= 1000
    ) {
        return valor;
    }

    return CACHE_TTL_PADRAO;
}

function normalizarTexto(valor) {
    return String(
        valor ?? ""
    ).trim();
}

function normalizarPergunta(
    pergunta,
    indice
) {
    const id =
        normalizarTexto(
            pergunta.id
        ) || `PERGUNTA-${indice + 1}`;

    const enunciado =
        normalizarTexto(
            pergunta.pergunta
        );

    const opcoes = [
        pergunta.altA,
        pergunta.altB,
        pergunta.altC,
        pergunta.altD,
    ].map(normalizarTexto);

    const correta =
        normalizarTexto(
            pergunta.correta
        );

    const pontosIniciais =
        Number(
            pergunta.pontosIniciais
        );

    const dicas = [
        pergunta.dica1,
        pergunta.dica2,
        pergunta.dica3,
    ]
        .map(normalizarTexto)
        .filter(Boolean);

    if (!enunciado) {
        return null;
    }

    if (
        opcoes.some(
            (opcao) => !opcao
        )
    ) {
        return null;
    }

    if (!correta) {
        return null;
    }

    if (
        !Number.isInteger(
            pontosIniciais
        ) ||
        pontosIniciais < 0
    ) {
        return null;
    }

    return {
        id,
        pergunta: enunciado,
        opcoes,
        correta,
        pontosIniciais,
        dicas: dicas.slice(0, 3),
    };
}

function transformarPerguntas(
    dados
) {
    const perguntas = dados
        .map(normalizarPergunta)
        .filter(Boolean);

    if (perguntas.length === 0) {
        const erro = new Error(
            "Nenhuma pergunta válida foi encontrada na planilha."
        );

        erro.statusCode = 502;

        throw erro;
    }

    const ids = new Set();

    for (
        const pergunta
        of perguntas
    ) {
        if (ids.has(pergunta.id)) {
            const erro = new Error(
                `A planilha possui o ID duplicado: ${pergunta.id}.`
            );

            erro.statusCode = 502;

            throw erro;
        }

        ids.add(pergunta.id);
    }

    return perguntas;
}

async function atualizarCache() {
    const dados =
        await perguntaRepository
            .buscarDaPlanilha();

    const perguntas =
        transformarPerguntas(dados);

    cache = perguntas;

    cacheExpiraEm =
        Date.now() + obterCacheTtl();

    return cache;
}

async function listarPerguntas() {
    const cacheValido =
        cache &&
        Date.now() <
            cacheExpiraEm;

    if (cacheValido) {
        return cache;
    }

    if (buscaEmAndamento) {
        return buscaEmAndamento;
    }

    buscaEmAndamento =
        atualizarCache();

    try {
        return await buscaEmAndamento;
    } catch (error) {
        if (cache) {
            return cache;
        }

        throw error;
    } finally {
        buscaEmAndamento = null;
    }
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