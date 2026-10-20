const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { resolverDatabaseUrl } = require("../config/databaseUrl");

test("resolve banco relativo a partir da pasta do schema Prisma", () => {
    const esperado = `file:${path.resolve(__dirname, "..", "prisma", "dev.db").replace(/\\/g, "/")}`;

    assert.equal(resolverDatabaseUrl("file:./dev.db"), esperado);
});

test("preserva caminho absoluto usado em produção e nos testes", () => {
    const databaseUrl = `file:${path.resolve(__dirname, "banco.db").replace(/\\/g, "/")}`;

    assert.equal(resolverDatabaseUrl(databaseUrl), databaseUrl);
});

test("usa o banco de desenvolvimento quando a variável não existe", () => {
    assert.match(resolverDatabaseUrl(), /\/prisma\/dev\.db$/);
});
