const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizarMunicipio,
    resolverMunicipio,
} = require("../utils/municipios");

test("resolve um município pela identidade oficial do IBGE", () => {
    const resultado = resolverMunicipio({
        cidade: "quixada",
        cidadeUf: "ce",
        municipioIbgeId: "2311306",
    });

    assert.deepEqual(resultado.municipio, {
        id: "2311306",
        nome: "Quixadá",
        nomeBusca: "QUIXADA",
        uf: "CE",
    });
});

test("recusa combinação incompatível de cidade, UF e código", () => {
    const resultado = resolverMunicipio({
        cidade: "Sobral",
        cidadeUf: "CE",
        municipioIbgeId: "2311306",
    });

    assert.match(resultado.erro, /não correspondem/);
});

test("mantém compatibilidade ao resolver nomes únicos sem código", () => {
    const resultado = resolverMunicipio({ cidade: "Quixadá" });

    assert.equal(resultado.municipio.id, "2311306");
    assert.equal(normalizarMunicipio("  Quixadá  "), "QUIXADA");
});
