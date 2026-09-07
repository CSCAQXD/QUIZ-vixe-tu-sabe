const test = require("node\:test");

const assert = require("node\:assert/strict");

const { validarSessao } = require("../schemas/sessao.schema");

test("normaliza uma sessão de turma única", () => {
    const dados = validarSessao({ nomeEscola: " Escola ", cidade: " Quixadá ", serie: "9", turma: " A ", pontuacaoOriginal: "100" });

    assert.deepEqual(dados, { nomeEscola: "Escola", cidade: "Quixadá", pontuacaoFinal: null, pontuacaoOriginal: 100, dicasUsadas: 0, turmas: [{ serie: 9, turma: "A" }] });
});

test("aceita pontuação final calculada pergunta a pergunta", () => {
    const dados = validarSessao({ nomeEscola: "E", cidade: "C", serie: 9, turma: "A", pontuacaoFinal: 275 });

    assert.equal(dados.pontuacaoFinal, 275);

    assert.equal(dados.pontuacaoOriginal, null);
});

test("aceita várias turmas distintas", () => {
    const dados = validarSessao({ nomeEscola: "E", cidade: "C", turmas: [{ serie: 8, turma: "A" }, { serie: 9, turma: "A" }], pontuacaoOriginal: 80, dicasUsadas: 2 });

    assert.equal(dados.turmas.length, 2);
});

test("rejeita turma duplicada sem diferenciar maiúsculas", () => {
    assert.throws(() => validarSessao({ nomeEscola: "E", cidade: "C", turmas: [{ serie: 9, turma: "a" }, { serie: 9, turma: "A" }], pontuacaoOriginal: 10 }), /repetir/);
});

test("rejeita pontuação negativa e limite de dicas inválido", () => {
    assert.throws(() => validarSessao({ nomeEscola: "E", cidade: "C", serie: 9, turma: "A", pontuacaoOriginal: -1 }), /pontuacaoOriginal/);

    assert.throws(() => validarSessao({ nomeEscola: "E", cidade: "C", serie: 9, turma: "A", pontuacaoOriginal: 1, dicasUsadas: 4 }), /dicasUsadas/);
});