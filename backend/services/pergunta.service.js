const { createHash } = require("node:crypto");
const perguntaRepository = require("../repositories/pergunta.repository");
const { normalizarFaixaPergunta, obterMenorFaixa } = require("../utils/faixaEnsino");

let cacheVersaoAtiva = null;
let carregamentoEmAndamento = null;

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
    const correta = normalizarTexto(pergunta.correta).toUpperCase();
    const pontosIniciais = Number(pergunta.pontosIniciais);
    const faixa = normalizarFaixaPergunta(pergunta.faixa);
    const dicas = [pergunta.dica1, pergunta.dica2, pergunta.dica3]
        .map(normalizarTexto)
        .filter(Boolean);

    if (
        !enunciado ||
        !tema ||
        opcoes.some((opcao) => !opcao) ||
        !["A", "B", "C", "D"].includes(correta) ||
        !faixa ||
        !Number.isInteger(pontosIniciais) ||
        pontosIniciais < 0
    ) {
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
    const processadas = dados.map(normalizarPergunta);
    const linhasInvalidas = processadas
        .map((pergunta, indice) => (pergunta ? null : indice + 2))
        .filter(Boolean);

    if (linhasInvalidas.length > 0) {
        const erro = new Error(
            `O arquivo possui ${linhasInvalidas.length} linha(s) inválida(s): ${linhasInvalidas
                .slice(0, 10)
                .join(", ")}.`,
        );
        erro.statusCode = 422;
        throw erro;
    }

    if (processadas.length === 0) {
        const erro = new Error("Nenhuma pergunta válida foi encontrada no arquivo.");
        erro.statusCode = 422;
        throw erro;
    }

    const ids = new Set();
    for (const pergunta of processadas) {
        if (ids.has(pergunta.id)) {
            const erro = new Error(`O arquivo possui o ID duplicado: ${pergunta.id}.`);
            erro.statusCode = 422;
            throw erro;
        }
        ids.add(pergunta.id);
    }

    return processadas;
}

function calcularHash(perguntas) {
    return createHash("sha256").update(JSON.stringify(perguntas)).digest("hex");
}

function compararPerguntas(atuais = [], candidatas = []) {
    const porIdAtual = new Map(atuais.map((pergunta) => [pergunta.id, pergunta]));
    const porIdCandidata = new Map(candidatas.map((pergunta) => [pergunta.id, pergunta]));
    const adicionadas = candidatas
        .filter((pergunta) => !porIdAtual.has(pergunta.id))
        .map((pergunta) => pergunta.id);
    const removidas = atuais
        .filter((pergunta) => !porIdCandidata.has(pergunta.id))
        .map((pergunta) => pergunta.id);
    const alteradas = candidatas
        .filter((pergunta) => {
            const atual = porIdAtual.get(pergunta.id);
            return atual && JSON.stringify(atual) !== JSON.stringify(pergunta);
        })
        .map((pergunta) => pergunta.id);

    return {
        adicionadas,
        alteradas,
        removidas,
        totais: {
            adicionadas: adicionadas.length,
            alteradas: alteradas.length,
            removidas: removidas.length,
        },
    };
}

async function validarArquivo(conteudoCsv) {
    const dados = perguntaRepository.interpretarCsv(conteudoCsv);
    const perguntas = transformarPerguntas(dados);
    const hash = calcularHash(perguntas);
    const ativa = await perguntaRepository.buscarVersaoAtiva();
    const diferencas = compararPerguntas(ativa?.perguntas, perguntas);

    if (ativa?.hash === hash) {
        return { resultado: "SEM_ALTERACOES", versao: ativa, diferencas };
    }

    const versao = await perguntaRepository.salvarVersao(perguntas, hash);
    return { resultado: "VERSAO_PRONTA", versao, diferencas };
}

async function ativarVersao(id) {
    const versao = await perguntaRepository.ativarVersao(id);
    cacheVersaoAtiva = versao;
    return versao;
}

async function carregarVersaoAtiva() {
    if (cacheVersaoAtiva) return cacheVersaoAtiva;

    const armazenada = await perguntaRepository.buscarVersaoAtiva();
    if (armazenada) {
        cacheVersaoAtiva = armazenada;
        return armazenada;
    }

    const erro = new Error(
        "Nenhuma versão de perguntas foi publicada. Envie um arquivo CSV pela Administração.",
    );
    erro.statusCode = 503;
    throw erro;
}

async function garantirVersaoAtiva() {
    if (!carregamentoEmAndamento) {
        carregamentoEmAndamento = carregarVersaoAtiva().finally(() => {
            carregamentoEmAndamento = null;
        });
    }

    return carregamentoEmAndamento;
}

async function listarPerguntas(turmas = []) {
    const versao = await garantirVersaoAtiva();
    return filtrarPorTurmas(versao.perguntas, turmas);
}

async function obterStatus() {
    const ativa = await perguntaRepository.buscarVersaoAtiva();
    const versoes = await perguntaRepository.listarVersoes();
    return { ativa, versoes };
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
    cacheVersaoAtiva = null;
    carregamentoEmAndamento = null;
}

module.exports = {
    ativarVersao,
    compararPerguntas,
    listarPerguntas,
    limparCache,
    obterStatus,
    transformarPerguntas,
    validarArquivo,
};
