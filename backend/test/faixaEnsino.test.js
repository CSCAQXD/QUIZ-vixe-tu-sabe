const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizarFaixaPergunta,
    obterFaixaEnsino,
    obterMenorFaixa,
} = require("../utils/faixaEnsino");

test("classifica as três faixas escolares", () => {
    assert.equal(
        obterFaixaEnsino({ etapaEnsino: "FUNDAMENTAL", serie: 5 }),
        "FUNDAMENTAL_1",
    );
    assert.equal(
        obterFaixaEnsino({ etapaEnsino: "FUNDAMENTAL", serie: 6 }),
        "FUNDAMENTAL_2",
    );
    assert.equal(
        obterFaixaEnsino({ etapaEnsino: "MEDIO", serie: 1 }),
        "MEDIO",
    );
});

test("escolhe a menor faixa em uma mediação mista", () => {
    const faixa = obterMenorFaixa([
        { etapaEnsino: "MEDIO", serie: 2 },
        { etapaEnsino: "FUNDAMENTAL", serie: 3 },
        { etapaEnsino: "FUNDAMENTAL", serie: 8 },
    ]);

    assert.equal(faixa, "FUNDAMENTAL_1");
});

test("aceita nomes amigáveis vindos da planilha", () => {
    assert.equal(normalizarFaixaPergunta("Fundamental I"), "FUNDAMENTAL_1");
    assert.equal(normalizarFaixaPergunta("Fundamental 2"), "FUNDAMENTAL_2");
    assert.equal(normalizarFaixaPergunta("Ensino Médio"), "MEDIO");
    assert.equal(normalizarFaixaPergunta(""), "TODAS");
});
