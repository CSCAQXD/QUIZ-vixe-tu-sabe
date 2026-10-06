const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const perguntaController = require("../controllers/pergunta.controller");
const perguntaService = require("../services/pergunta.service");

test.afterEach(() => mock.restoreAll());

test("encaminha todas as turmas para seleção da faixa", async () => {
    let turmasRecebidas;
    mock.method(perguntaService, "listarPerguntas", async (turmas) => {
        turmasRecebidas = turmas;
        return [];
    });

    const resposta = {};
    const res = {
        setHeader: () => {},
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
});
