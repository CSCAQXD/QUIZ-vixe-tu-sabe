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
