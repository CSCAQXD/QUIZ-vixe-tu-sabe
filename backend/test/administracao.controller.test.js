const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const administracaoController = require("../controllers/administracao.controller");
const administracaoService = require("../services/administracao.service");

test.afterEach(() => mock.restoreAll());

function criarResposta() {
    const resposta = { headers: {} };
    const res = {
        setHeader(nome, valor) {
            resposta.headers[nome] = valor;
        },
        status(codigo) {
            resposta.status = codigo;
            return this;
        },
        send(valor) {
            resposta.corpo = valor;
            return this;
        },
        json(valor) {
            resposta.corpo = valor;
            return this;
        },
    };
    return { res, resposta };
}

test("devolve a planilha anual como arquivo para download", async () => {
    const planilha = Buffer.from("xlsx");
    const exportar = mock.method(administracaoService, "exportarRankings", async () => planilha);
    const { res, resposta } = criarResposta();

    await administracaoController.exportarRankings({ query: { ano: "2026" } }, res, assert.fail);

    assert.equal(exportar.mock.calls[0].arguments[0], 2026);
    assert.equal(resposta.status, 200);
    assert.match(resposta.headers["Content-Disposition"], /rankings-2026\.xlsx/);
    assert.equal(
        resposta.headers["Content-Type"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    assert.equal(resposta.corpo, planilha);
});

test("encaminha senha e confirmação para reiniciar o ano", async () => {
    const reiniciar = mock.method(administracaoService, "reiniciarRankings", async () => ({
        partidas: 4,
        participacoes: 7,
    }));
    const { res, resposta } = criarResposta();

    await administracaoController.reiniciarRankings(
        {
            body: {
                ano: 2026,
                confirmacao: "APAGAR DADOS DE 2026",
                senhaAdministrativa: "segredo",
            },
        },
        res,
        assert.fail,
    );

    assert.deepEqual(reiniciar.mock.calls[0].arguments[0], {
        ano: 2026,
        confirmacao: "APAGAR DADOS DE 2026",
        senhaAdministrativa: "segredo",
    });
    assert.equal(resposta.corpo.mensagem, "Os dados de 2026 foram apagados.");
    assert.deepEqual(resposta.corpo.removidos, { partidas: 4, participacoes: 7 });
});

test("recusa ano inválido antes de executar uma operação administrativa", async () => {
    const exportar = mock.method(administracaoService, "exportarRankings", async () =>
        Buffer.alloc(0),
    );
    let erro;

    await administracaoController.exportarRankings({ query: { ano: "1999" } }, {}, (falha) => {
        erro = falha;
    });

    assert.equal(erro.statusCode, 400);
    assert.equal(exportar.mock.callCount(), 0);
});
