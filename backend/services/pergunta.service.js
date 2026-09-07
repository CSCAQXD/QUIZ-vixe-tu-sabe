const perguntaRepository = require(
    "../repositories/pergunta.repository"
);

const CACHE_TTL_MS =
    Number(
        process.env.PERGUNTAS_CACHE_TTL_MS
    ) || 300000;

let cachePerguntas = null;
let cacheExpiraEm = 0;

function transformarPergunta(pergunta) {
    return {
        id: String(
            pergunta.id || "sem-id"
        ).trim(),

        pergunta: String(
            pergunta.pergunta || ""
        ).trim(),

        opcoes: [
            pergunta.altA,
            pergunta.altB,
            pergunta.altC,
            pergunta.altD,
        ]
            .map((opcao) =>
                String(opcao || "").trim()
            )
            .filter(Boolean),

        correta: String(
            pergunta.correta || ""
        ).trim(),

        pontosIniciais:
            Number(
                pergunta.pontosIniciais
            ) || 0,

        dicas: [
            pergunta.dica1,
            pergunta.dica2,
            pergunta.dica3,
        ]
            .map((dica) =>
                String(dica || "").trim()
            )
            .filter(Boolean),
    };
}

async function listarPerguntas() {
    if (
        cachePerguntas &&
        Date.now() < cacheExpiraEm
    ) {
        return cachePerguntas;
    }

    let dados;

    try {
        dados =
            await perguntaRepository.buscarDaPlanilha();
    } catch (error) {
        if (cachePerguntas) {
            return cachePerguntas;
        }

        error.statusCode = 503;
        throw error;
    }

    const perguntasValidas = dados
        .map(transformarPergunta)
        .filter(
            (pergunta) =>
                pergunta.pergunta &&
                pergunta.opcoes.length === 4 &&
                pergunta.correta
        );

    if (perguntasValidas.length === 0) {
        const erro = new Error(
            "Nenhuma pergunta válida encontrada na planilha."
        );

        erro.statusCode = 502;

        throw erro;
    }

    cachePerguntas = perguntasValidas;
    cacheExpiraEm =
        Date.now() + CACHE_TTL_MS;

    return cachePerguntas;
}

module.exports = {
    listarPerguntas,
};