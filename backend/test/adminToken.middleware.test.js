const test = require("node:test");
const assert = require("node:assert/strict");
const adminToken = require("../middlewares/adminToken.middleware");

const token = "token-administrativo-com-32-caracteres";

test.beforeEach(() => {
    process.env.PERGUNTAS_ADMIN_TOKEN = token;
});

test.afterEach(() => {
    delete process.env.PERGUNTAS_ADMIN_TOKEN;
});

test("autoriza o token enviado como Bearer", () => {
    let avancou = false;
    const req = { get: (nome) => (nome === "Authorization" ? `Bearer ${token}` : undefined) };

    adminToken(req, {}, (erro) => {
        assert.equal(erro, undefined);
        avancou = true;
    });

    assert.equal(avancou, true);
});

test("recusa token inválido sem revelar o valor esperado", () => {
    const req = { get: () => "Bearer incorreto" };
    let erro;

    adminToken(req, {}, (falha) => {
        erro = falha;
    });

    assert.equal(erro.statusCode, 401);
    assert.equal(erro.message, "Token administrativo inválido.");
});

test("indica quando o token administrativo não foi configurado", () => {
    delete process.env.PERGUNTAS_ADMIN_TOKEN;
    const req = { get: () => undefined };
    let erro;

    adminToken(req, {}, (falha) => {
        erro = falha;
    });

    assert.equal(erro.statusCode, 503);
});
