const axios = require("axios");
const Papa = require("papaparse");
const prisma = require("../config/prisma");

function obterConfiguracao() {
    const csvUrl = process.env.PERGUNTAS_CSV_URL;

    const timeoutMs = Number(process.env.PERGUNTAS_TIMEOUT_MS) || 5000;

    if (!csvUrl) {
        const erro = new Error("PERGUNTAS_CSV_URL não está configurada.");

        erro.statusCode = 500;

        throw erro;
    }

    return {
        csvUrl,
        timeoutMs,
    };
}

async function buscarDaPlanilha() {
    const { csvUrl, timeoutMs } = obterConfiguracao();

    let resposta;

    try {
        resposta = await axios.get(csvUrl, {
            timeout: timeoutMs,
            responseType: "text",
            maxContentLength: 2 * 1024 * 1024,
            headers: {
                Accept: "text/csv,text/plain",
            },
        });
    } catch (error) {
        const erro = new Error("Não foi possível consultar a planilha de perguntas.");

        erro.statusCode = 503;
        erro.cause = error;

        throw erro;
    }

    if (typeof resposta.data !== "string") {
        const erro = new Error("A planilha retornou um conteúdo inválido.");

        erro.statusCode = 502;

        throw erro;
    }

    const resultado = Papa.parse(resposta.data, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (cabecalho) => cabecalho.trim(),
    });

    const errosRelevantes = resultado.errors.filter((erro) => erro.type !== "FieldMismatch");

    if (errosRelevantes.length > 0) {
        const erro = new Error("A planilha contém um CSV inválido.");

        erro.statusCode = 502;

        throw erro;
    }

    if (!Array.isArray(resultado.data)) {
        const erro = new Error("A planilha não contém perguntas válidas.");

        erro.statusCode = 502;

        throw erro;
    }

    return resultado.data;
}

const incluirPerguntas = {
    perguntas: {
        orderBy: { ordem: "asc" },
    },
};

function mapearPergunta(pergunta) {
    return {
        id: pergunta.idExterno,
        faixa: pergunta.faixa,
        tema: pergunta.tema,
        pergunta: pergunta.enunciado,
        opcoes: [pergunta.altA, pergunta.altB, pergunta.altC, pergunta.altD],
        correta: pergunta.correta,
        pontosIniciais: pergunta.pontosIniciais,
        dicas: [pergunta.dica1, pergunta.dica2, pergunta.dica3].filter(Boolean),
    };
}

function mapearVersao(versao) {
    if (!versao) return null;

    return {
        id: versao.id,
        criadaEm: versao.criadaEm,
        ativadaEm: versao.ativadaEm,
        status: versao.status,
        hash: versao.hash,
        total: versao.total,
        ...(versao.perguntas ? { perguntas: versao.perguntas.map(mapearPergunta) } : {}),
    };
}

async function buscarVersaoAtiva(cliente = prisma) {
    const versao = await cliente.versaoPerguntas.findFirst({
        where: { status: "ATIVA" },
        orderBy: { ativadaEm: "desc" },
        include: incluirPerguntas,
    });

    return mapearVersao(versao);
}

async function buscarVersaoPorId(id, cliente = prisma) {
    const versao = await cliente.versaoPerguntas.findUnique({
        where: { id },
        include: incluirPerguntas,
    });

    return mapearVersao(versao);
}

async function salvarVersao(perguntas, hash, cliente = prisma) {
    const existente = await cliente.versaoPerguntas.findUnique({
        where: { hash },
        include: incluirPerguntas,
    });

    if (existente) return mapearVersao(existente);

    const versao = await cliente.versaoPerguntas.create({
        data: {
            hash,
            total: perguntas.length,
            perguntas: {
                create: perguntas.map((pergunta, ordem) => ({
                    idExterno: pergunta.id,
                    ordem,
                    faixa: pergunta.faixa,
                    tema: pergunta.tema,
                    enunciado: pergunta.pergunta,
                    altA: pergunta.opcoes[0],
                    altB: pergunta.opcoes[1],
                    altC: pergunta.opcoes[2],
                    altD: pergunta.opcoes[3],
                    correta: pergunta.correta,
                    pontosIniciais: pergunta.pontosIniciais,
                    dica1: pergunta.dicas[0] || null,
                    dica2: pergunta.dicas[1] || null,
                    dica3: pergunta.dicas[2] || null,
                })),
            },
        },
        include: incluirPerguntas,
    });

    return mapearVersao(versao);
}

async function ativarVersao(id, cliente = prisma) {
    return cliente.$transaction(async (transacao) => {
        const versao = await transacao.versaoPerguntas.findUnique({ where: { id } });

        if (!versao) {
            const erro = new Error("A versão de perguntas não foi encontrada.");
            erro.statusCode = 404;
            throw erro;
        }

        await transacao.versaoPerguntas.updateMany({
            where: { status: "ATIVA", id: { not: id } },
            data: { status: "ARQUIVADA" },
        });

        const atualizada = await transacao.versaoPerguntas.update({
            where: { id },
            data: { status: "ATIVA", ativadaEm: new Date() },
            include: incluirPerguntas,
        });

        return mapearVersao(atualizada);
    });
}

async function listarVersoes(cliente = prisma) {
    const versoes = await cliente.versaoPerguntas.findMany({
        orderBy: { criadaEm: "desc" },
        take: 20,
    });

    return versoes.map(mapearVersao);
}

module.exports = {
    ativarVersao,
    buscarDaPlanilha,
    buscarVersaoAtiva,
    buscarVersaoPorId,
    listarVersoes,
    salvarVersao,
};
