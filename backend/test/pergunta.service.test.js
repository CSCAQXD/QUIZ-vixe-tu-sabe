const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const perguntaRepository = require("../repositories/pergunta.repository");

const perguntaService = require("../services/pergunta.service");

function criarPergunta(alteracoes = {}) {
    return {
        id: "1",
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

test("transforma corretamente uma pergunta da planilha", async () => {
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => [criarPergunta()]);

    const perguntas = await perguntaService.listarPerguntas();

    assert.deepEqual(perguntas, [
        {
            id: "1",
            tema: "História & Vida",
            pergunta: "Quem foi Cego Aderaldo?",
            opcoes: ["Um poeta", "Um arquiteto", "Um pintor", "Um escultor"],
            correta: "A",
            pontosIniciais: 100,
            dicas: ["Era conhecido pela poesia."],
        },
    ]);
});

test("utiliza o cache na segunda consulta", async () => {
    const buscar = mock.method(perguntaRepository, "buscarDaPlanilha", async () => [
        criarPergunta(),
    ]);

    await perguntaService.listarPerguntas();

    await perguntaService.listarPerguntas();

    assert.equal(buscar.mock.callCount(), 1);
});

test("reutiliza o cache se a planilha ficar indisponível", async () => {
    let quantidadeChamadas = 0;

    mock.method(perguntaRepository, "buscarDaPlanilha", async () => {
        quantidadeChamadas += 1;

        if (quantidadeChamadas === 1) {
            return [criarPergunta()];
        }

        throw new Error("Planilha indisponível");
    });

    const primeiraConsulta = await perguntaService.listarPerguntas();

    process.env.PERGUNTAS_CACHE_TTL_MS = "1000";

    const segundaConsulta = await perguntaService.listarPerguntas();

    assert.deepEqual(segundaConsulta, primeiraConsulta);
});

test("recusa a atualização inteira quando existe uma linha incompleta", async () => {
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => [
        criarPergunta(),
        criarPergunta({
            id: "2",
            pergunta: "",
        }),
    ]);

    await assert.rejects(() => perguntaService.listarPerguntas(), /linha\(s\) inválida\(s\): 3/);
});

test("rejeita IDs duplicados", async () => {
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => [
        criarPergunta(),
        criarPergunta({
            pergunta: "Outra pergunta",
        }),
    ]);

    await assert.rejects(() => perguntaService.listarPerguntas(), /ID duplicado/);
});

test("retorna erro quando não existem perguntas válidas", async () => {
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => []);

    await assert.rejects(() => perguntaService.listarPerguntas(), /Nenhuma pergunta válida/);
});

test("filtra perguntas usando a menor faixa da mediação", async () => {
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => [
        criarPergunta({ id: "geral", faixa: "Todas" }),
        criarPergunta({ id: "f1", faixa: "Fundamental I" }),
        criarPergunta({ id: "f2", faixa: "Fundamental II" }),
        criarPergunta({ id: "medio", faixa: "Ensino Médio" }),
    ]);

    const perguntas = await perguntaService.listarPerguntas([
        { etapaEnsino: "MEDIO", serie: 1 },
        { etapaEnsino: "FUNDAMENTAL", serie: 4 },
    ]);

    assert.deepEqual(
        perguntas.map((pergunta) => pergunta.id),
        ["geral", "f1"],
    );
});

test("retorna quantidade variável de perguntas da faixa e comuns", async () => {
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => [
        ...Array.from({ length: 26 }, (_, indice) =>
            criarPergunta({
                id: `f1-${indice}`,
                faixa: "FUNDAMENTAL1",
            }),
        ),
        ...Array.from({ length: 7 }, (_, indice) =>
            criarPergunta({
                id: `comum-${indice}`,
                faixa: "COMUM",
            }),
        ),
        criarPergunta({ id: "medio", faixa: "ENSINOMEDIO" }),
    ]);
    const perguntas = await perguntaService.listarPerguntas([
        { etapaEnsino: "FUNDAMENTAL", serie: 4 },
    ]);
    assert.equal(perguntas.length, 33);
    assert.equal(new Set(perguntas.map((pergunta) => pergunta.id)).size, 33);
    assert.ok(perguntas.every((pergunta) => pergunta.id !== "medio"));
});

test("usa a versão ativa local sem consultar a planilha", async () => {
    mock.restoreAll();
    perguntaService.limparCache();
    mock.method(perguntaRepository, "buscarVersaoAtiva", async () => ({
        id: "ativa",
        status: "ATIVA",
        hash: "hash",
        total: 1,
        perguntas: [
            {
                id: "local",
                faixa: "FUNDAMENTAL_1",
                tema: "Tema",
                pergunta: "Pergunta local?",
                opcoes: ["A", "B", "C", "D"],
                correta: "A",
                pontosIniciais: 100,
                dicas: [],
            },
        ],
    }));
    const buscarRemota = mock.method(perguntaRepository, "buscarDaPlanilha", async () => {
        throw new Error("Sem internet");
    });

    const perguntas = await perguntaService.listarPerguntas();

    assert.equal(perguntas[0].id, "local");
    assert.equal(buscarRemota.mock.callCount(), 0);
});

test("valida diferenças sem ativar automaticamente a candidata", async () => {
    const atual = criarPergunta({ id: "mantida", faixa: "Fundamental I" });
    const ativa = {
        id: "ativa",
        status: "ATIVA",
        hash: "anterior",
        perguntas: [
            {
                id: "removida",
                faixa: "FUNDAMENTAL_1",
                tema: "Tema",
                pergunta: "Antiga?",
                opcoes: ["A", "B", "C", "D"],
                correta: "A",
                pontosIniciais: 100,
                dicas: [],
            },
        ],
    };
    perguntaRepository.buscarVersaoAtiva.mock.mockImplementation(async () => ativa);
    mock.method(perguntaRepository, "buscarDaPlanilha", async () => [atual]);

    const resultado = await perguntaService.validarAtualizacao();

    assert.equal(resultado.resultado, "VERSAO_PRONTA");
    assert.deepEqual(resultado.diferencas.totais, {
        adicionadas: 1,
        alteradas: 0,
        removidas: 1,
    });
    assert.equal(perguntaRepository.ativarVersao.mock.callCount(), 0);
});
