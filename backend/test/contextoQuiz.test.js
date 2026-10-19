const test = require("node:test");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { mock } = require("node:test");
const { criarContextoQuiz, validarContextoQuiz } = require("../utils/contextoQuiz");

const turmas = [
    { etapaEnsino: "FUNDAMENTAL", serie: 4 },
    { etapaEnsino: "FUNDAMENTAL", serie: 8 },
    { etapaEnsino: "MEDIO", serie: 3 },
];
const segredoAnterior = process.env.QUIZ_CONTEXT_SECRET;
process.env.QUIZ_CONTEXT_SECRET = "segredo-exclusivo-dos-testes";
test.afterEach(() => mock.restoreAll());
test.after(() => {
    if (segredoAnterior === undefined) delete process.env.QUIZ_CONTEXT_SECRET;
    else process.env.QUIZ_CONTEXT_SECRET = segredoAnterior;
});

function assinarPayload(payload) {
    const conteudo = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const assinatura = createHmac("sha256", process.env.QUIZ_CONTEXT_SECRET)
        .update(conteudo).digest("base64url");
    return `${conteudo}.${assinatura}`;
}

test("preserva a menor faixa global para escolas de categorias diferentes", () => {
    const { contextoQuiz, categoriaQuiz } = criarContextoQuiz(turmas);
    assert.equal(categoriaQuiz, "FUNDAMENTAL_1");
    assert.equal(validarContextoQuiz(contextoQuiz, [turmas[2]]), "FUNDAMENTAL_1");
    assert.equal(validarContextoQuiz(contextoQuiz, turmas), "FUNDAMENTAL_1");
});

test("emite categorias canônicas para fundamental II e médio", () => {
    assert.equal(criarContextoQuiz([turmas[1], turmas[2]]).categoriaQuiz, "FUNDAMENTAL_2");
    assert.equal(criarContextoQuiz([turmas[2]]).categoriaQuiz, "MEDIO");
});

test("permite até cem turmas globais e recusa participantes excedentes", () => {
    const participantes = Array.from({ length: 100 }, () => turmas[0]);
    const { contextoQuiz } = criarContextoQuiz(participantes);
    assert.equal(validarContextoQuiz(contextoQuiz, participantes), "FUNDAMENTAL_1");
    assert.throws(() => criarContextoQuiz([...participantes, turmas[1]]), { statusCode: 400 });
});

test("rejeita turmas alteradas ou repetidas além dos participantes originais", () => {
    const { contextoQuiz } = criarContextoQuiz(turmas);
    const invalido = (error) => error.statusCode === 400 && /nova mediação/.test(error.message);
    assert.throws(() => validarContextoQuiz(contextoQuiz, [
        { etapaEnsino: "FUNDAMENTAL", serie: 5 },
    ]), invalido);
    assert.throws(() => validarContextoQuiz(contextoQuiz, [turmas[2], turmas[2]]), invalido);
});
