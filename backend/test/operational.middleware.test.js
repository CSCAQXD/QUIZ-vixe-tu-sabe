const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const express = require("express");
const requestContext = require("../middlewares/requestContext.middleware");
const { criarLimitadorEscritas } = require("../middlewares/rateLimit.middleware");

async function comServidor(app, executar) {
    const servidor = app.listen(0, "127.0.0.1");
    await once(servidor, "listening");
    try {
        return await executar(`http://127.0.0.1:${servidor.address().port}`);
    } finally {
        const fechado = new Promise((resolve, reject) =>
            servidor.close((erro) => (erro ? reject(erro) : resolve())),
        );
        servidor.closeAllConnections?.();
        await fechado;
    }
}

test("preserva um request ID válido e substitui um valor inseguro", async () => {
    const app = express();
    app.use(requestContext);
    app.get("/", (req, res) => res.json({ requestId: req.requestId }));

    await comServidor(app, async (origem) => {
        const preservada = await fetch(origem, { headers: { "X-Request-ID": "teste-123" } });
        assert.equal(preservada.headers.get("x-request-id"), "teste-123");
        assert.equal((await preservada.json()).requestId, "teste-123");

        const substituida = await fetch(origem, { headers: { "X-Request-ID": "valor inválido" } });
        const requestId = substituida.headers.get("x-request-id");
        assert.match(requestId, /^[0-9a-f-]{36}$/);
        assert.equal((await substituida.json()).requestId, requestId);
    });
});

test("bloqueia escritas acima do limite e devolve o request ID", async () => {
    const app = express();
    app.use(requestContext);
    app.post("/", criarLimitadorEscritas({ windowMs: 60_000, limit: 1 }), (req, res) =>
        res.sendStatus(204),
    );

    await comServidor(app, async (origem) => {
        assert.equal((await fetch(origem, { method: "POST" })).status, 204);
        const bloqueada = await fetch(origem, { method: "POST" });
        assert.equal(bloqueada.status, 429);
        assert.match(bloqueada.headers.get("ratelimit"), /r=0/);
        const corpo = await bloqueada.json();
        assert.equal(corpo.requestId, bloqueada.headers.get("x-request-id"));
    });
});

test("a aplicação expõe headers seguros, health e ready", async () => {
    const prisma = require("../config/prisma");
    const consultaOriginal = prisma.$queryRawUnsafe;
    prisma.$queryRawUnsafe = async () => [{ 1: 1 }];
    const app = require("../app");

    try {
        await comServidor(app, async (origem) => {
            const health = await fetch(`${origem}/health`);
            assert.equal(health.status, 200);
            assert.match(health.headers.get("content-security-policy"), /default-src 'self'/);
            assert.equal(health.headers.get("x-content-type-options"), "nosniff");
            assert.equal(health.headers.get("x-powered-by"), null);
            assert.ok(health.headers.get("x-request-id"));

            const ready = await fetch(`${origem}/ready`);
            assert.equal(ready.status, 200);
            assert.deepEqual(await ready.json(), { status: "ready" });
        });
    } finally {
        prisma.$queryRawUnsafe = consultaOriginal;
    }
});
