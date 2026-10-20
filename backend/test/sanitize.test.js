const test = require("node:test");
const assert = require("node:assert/strict");
const { chaveEntidade } = require("../utils/sanitize");

test("ignora acentos e caixa na identidade", () => {
    assert.equal(chaveEntidade("  Júlio   França "), chaveEntidade("julio franca"));
});

test("ignora o prefixo EEEP no início do nome escolar", () => {
    assert.equal(chaveEntidade("EEEP Júlio França", true), chaveEntidade("Júlio França", true));
});

test("mantém o prefixo quando a normalização não é escolar", () => {
    assert.notEqual(chaveEntidade("EEEP Júlio França"), chaveEntidade("Júlio França"));
});
