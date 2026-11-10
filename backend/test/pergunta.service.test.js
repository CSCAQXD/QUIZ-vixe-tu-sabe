const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const perguntaRepository = require("../repositories/pergunta.repository");
const perguntaService = require("../services/pergunta.service");

function criarPergunta(alteracoes = {}) {
    return {
        id: "1",
        faixa: "Todas",
        tema: "História & Vida",
        pergunta: "Quem foi Cego Aderaldo?",
        altA: "Um poeta",
        altB: "Um arquiteto",
        altC: "Um pintor",
        altD: "Um escultor",
        correta: "A",
        pontosIniciais: "100",
        dica1: "Era conhecido pela poesia.",
        dica2: "",
        dica3: "",
        ...alteracoes,
    };
}

function criarCsv(perguntas) {
    const cabecalho = [
        "id",
        "faixa",
        "tema",
        "pergunta",
        "altA",
        "altB",
        "altC",
        "altD",
        "correta",
        "pontosIniciais",
        "dica1",
        "dica2",
        "dica3",
    ];
    const escapar = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;
    return [
        cabecalho.join(","),
        ...perguntas.map((item) => cabecalho.map((campo) => escapar(item[campo])).join(",")),
    ].join("\n");
}

let versaoSalva;

test.beforeEach(() => {
    perguntaService.limparCache();
    versaoSalva = null;
    mock.method(perguntaRepository, "buscarVersaoAtiva", async () => null);
    mock.method(perguntaRepository, "salvarVersao", async (perguntas, hash) => {
        versaoSalva = {
            id: "versao-1",
            status: "RASCUNHO",
            hash,
            total: perguntas.length,
            perguntas,
        };
        return versaoSalva;
    });
    mock.method(perguntaRepository, "ativarVersao", async () => ({
        ...versaoSalva,
        status: "ATIVA",
    }));
    mock.method(perguntaRepository, "listarVersoes", async () => []);
});

test.afterEach(() => {
    mock.restoreAll();
    perguntaService.limparCache();
});

test("valida um CSV e mantém a versão candidata sem ativá-la", async () => {
    const resultado = await perguntaService.validarArquivo(criarCsv([criarPergunta()]));
    assert.equal(resultado.resultado, "VERSAO_PRONTA");
    assert.equal(resultado.versao.total, 1);
    assert.equal(resultado.versao.perguntas[0].pergunta, "Quem foi Cego Aderaldo?");
    assert.equal(perguntaRepository.ativarVersao.mock.callCount(), 0);
});

test("recusa o arquivo inteiro quando existe uma linha incompleta", async () => {
    const csv = criarCsv([criarPergunta(), criarPergunta({ id: "2", pergunta: "" })]);
    await assert.rejects(() => perguntaService.validarArquivo(csv), /linha\(s\) inválida\(s\): 3/);
});

test("rejeita IDs duplicados", async () => {
    const csv = criarCsv([criarPergunta(), criarPergunta({ pergunta: "Outra pergunta" })]);
    await assert.rejects(() => perguntaService.validarArquivo(csv), /ID duplicado/);
});

test("informa quando o arquivo está igual à versão ativa", async () => {
    const csv = criarCsv([criarPergunta()]);
    const primeira = await perguntaService.validarArquivo(csv);
    perguntaRepository.buscarVersaoAtiva.mock.mockImplementation(async () => ({
        ...primeira.versao,
        status: "ATIVA",
    }));
    const resultado = await perguntaService.validarArquivo(csv);
    assert.equal(resultado.resultado, "SEM_ALTERACOES");
});

test("usa a versão ativa local sem depender de fonte externa", async () => {
    perguntaRepository.buscarVersaoAtiva.mock.mockImplementation(async () => ({
        id: "ativa",
        status: "ATIVA",
        hash: "hash",
        total: 1,
        perguntas: [
            {
                id: "local",
                faixa: "TODAS",
                tema: "Tema",
                pergunta: "Pergunta local?",
                opcoes: ["A", "B", "C", "D"],
                correta: "A",
                pontosIniciais: 100,
                dicas: [],
            },
        ],
    }));
    const perguntas = await perguntaService.listarPerguntas();
    assert.equal(perguntas[0].id, "local");
});

test("orienta o envio de CSV quando o banco ainda não tem versão ativa", async () => {
    await assert.rejects(
        () => perguntaService.listarPerguntas(),
        (erro) => erro.statusCode === 503 && /Envie um arquivo CSV/.test(erro.message),
    );
});

test("calcula adições, alterações e remoções antes da publicação", async () => {
    perguntaRepository.buscarVersaoAtiva.mock.mockImplementation(async () => ({
        id: "ativa",
        status: "ATIVA",
        hash: "anterior",
        perguntas: [
            {
                id: "removida",
                faixa: "TODAS",
                tema: "Tema",
                pergunta: "Antiga?",
                opcoes: ["A", "B", "C", "D"],
                correta: "A",
                pontosIniciais: 100,
                dicas: [],
            },
        ],
    }));
    const resultado = await perguntaService.validarArquivo(
        criarCsv([criarPergunta({ id: "adicionada" })]),
    );
    assert.deepEqual(resultado.diferencas.totais, { adicionadas: 1, alteradas: 0, removidas: 1 });
});
