const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const perguntaController = require("../controllers/pergunta.controller");
const perguntaService = require("../services/pergunta.service");
const { validarContextoQuiz } = require("../utils/contextoQuiz");

test.afterEach(() => mock.restoreAll());

test("encaminha todas as turmas para seleção da faixa", async () => {
    let turmasRecebidas;
    mock.method(perguntaService, "listarPerguntas", async (turmas) => {
        turmasRecebidas = turmas;
        return [];
    });

    const resposta = { headers: {} };
    const res = {
        setHeader: (nome, valor) => {
            resposta.headers[nome] = valor;
        },
        status: (codigo) => {
            resposta.status = codigo;
            return res;
        },
        json: (dados) => {
            resposta.dados = dados;
            return res;
        },
    };

    await perguntaController.listarPerguntas(
        {
            query: {
                turma: ["MEDIO:2", "FUNDAMENTAL:4"],
            },
        },
        res,
        assert.fail,
    );

    assert.deepEqual(turmasRecebidas, [
        { etapaEnsino: "MEDIO", serie: 2 },
        { etapaEnsino: "FUNDAMENTAL", serie: 4 },
    ]);
    assert.equal(resposta.status, 200);
    assert.equal(resposta.headers["Cache-Control"], "private, no-store");
    assert.equal(resposta.dados.categoriaQuiz, "FUNDAMENTAL_1");
    assert.equal(
        validarContextoQuiz(resposta.dados.contextoQuiz, turmasRecebidas),
        "FUNDAMENTAL_1",
    );
});

test("recusa participantes malformados antes de consultar a planilha", async () => {
    const buscar = mock.method(perguntaService, "listarPerguntas", async () => []);
    const invalidos = [
        "MEDIO:4",
        "FUNDAMENTAL:0",
        "MEDIO:2:extra",
        {},
        Array.from({ length: 101 }, () => "MEDIO:2"),
    ];
    for (const turma of invalidos) {
        let erro;
        await perguntaController.listarPerguntas({ query: { turma } }, {}, (falha) => {
            erro = falha;
        });
        assert.equal(erro.statusCode, 400);
    }
    assert.equal(buscar.mock.callCount(), 0);
});

test("retorna o status sem expor o conteúdo das perguntas", async () => {
    mock.method(perguntaService, "obterStatus", async () => ({
        ativa: {
            id: "ativa",
            total: 50,
            status: "ATIVA",
            perguntas: [{ id: "segredo" }],
        },
        versoes: [{ id: "ativa", total: 50, status: "ATIVA" }],
    }));
    const resposta = {};
    const res = {
        status(codigo) {
            resposta.status = codigo;
            return this;
        },
        json(dados) {
            resposta.dados = dados;
            return this;
        },
    };

    await perguntaController.obterStatus({}, res, assert.fail);

    assert.equal(resposta.status, 200);
    assert.equal(resposta.dados.ativa.total, 50);
    assert.equal("perguntas" in resposta.dados.ativa, false);
});

test("valida o arquivo sem ativar a versão candidata", async () => {
    const validar = mock.method(perguntaService, "validarArquivo", async () => ({
        resultado: "VERSAO_PRONTA",
        versao: { id: "rascunho", total: 51, perguntas: [{ id: "1" }] },
        diferencas: { totais: { adicionadas: 1, alteradas: 0, removidas: 0 } },
    }));
    const ativar = mock.method(perguntaService, "ativarVersao", async () => {});
    let dados;
    const res = { status: () => res, json: (valor) => (dados = valor) };

    await perguntaController.validarArquivo({ body: "conteudo csv" }, res, assert.fail);

    assert.equal(validar.mock.callCount(), 1);
    assert.equal(validar.mock.calls[0].arguments[0], "conteudo csv");
    assert.equal(ativar.mock.callCount(), 0);
    assert.equal(dados.versao.id, "rascunho");
    assert.equal("perguntas" in dados.versao, false);
});
