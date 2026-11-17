const test = require("node:test");
const assert = require("node:assert/strict");
const errorMiddleware = require("../middlewares/error.middleware");

test("não expõe detalhes técnicos de erros internos", () => {
    const originalError = console.error;
    console.error = () => {};
    let status;
    let body;
    const response = {
        headersSent: false,
        status(value) {
            status = value;
            return this;
        },
        json(value) {
            body = value;
            return this;
        },
    };

    errorMiddleware(
        new Error("Invalid prisma invocation at C:\\secret\\file.js"),
        { method: "POST", originalUrl: "/sessao" },
        response,
        () => {},
    );
    console.error = originalError;

    assert.equal(status, 500);
    assert.deepEqual(body, { erro: "Erro interno do servidor." });
});

test("expõe uma orientação segura quando um recurso não está configurado", () => {
    const originalError = console.error;
    console.error = () => {};
    let status;
    let body;
    const response = {
        headersSent: false,
        status(value) {
            status = value;
            return this;
        },
        json(value) {
            body = value;
            return this;
        },
    };
    const error = new Error("A administração das perguntas não está configurada.");
    error.statusCode = 503;
    error.expose = true;

    errorMiddleware(
        error,
        { method: "GET", originalUrl: "/perguntas/admin/status" },
        response,
        () => {},
    );
    console.error = originalError;

    assert.equal(status, 503);
    assert.deepEqual(body, { erro: "A administração das perguntas não está configurada." });
});

test("expõe apenas o código público de erros recuperáveis", () => {
    let status;
    let body;
    const response = {
        headersSent: false,
        status(value) {
            status = value;
            return this;
        },
        json(value) {
            body = value;
            return this;
        },
    };
    const error = new Error("Contexto inválido.");
    error.statusCode = 400;
    error.publicCode = "QUIZ_CONTEXT_INVALID";

    errorMiddleware(error, { method: "POST", originalUrl: "/sessao" }, response, () => {});

    assert.equal(status, 400);
    assert.deepEqual(body, {
        codigo: "QUIZ_CONTEXT_INVALID",
        erro: "Contexto inválido.",
    });
});
