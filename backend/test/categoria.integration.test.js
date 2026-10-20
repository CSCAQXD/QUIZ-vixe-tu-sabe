const test = require("node:test");
const assert = require("node:assert/strict");
const { iniciarCenario, pergunta } = require("./categoryIntegration.helper");

test("HTTP integra perguntas, contexto misto e quatro rankings em SQLite isolado", { timeout: 120000 }, async (t) => {
    const repositorio = require("../repositories/pergunta.repository");
    t.mock.method(repositorio, "buscarDaPlanilha", async () => [
        pergunta("f1-a", "fundamental 1"), pergunta("f1-b", "fundamental 1"),
        pergunta("f2", "fundamental 2"), pergunta("medio", "ensino medio"),
        pergunta("comum-a", "comum"), pergunta("comum-b", "comum"),
    ]);
    const servicoPerguntas = require("../services/pergunta.service");
    servicoPerguntas.limparCache();
    const cenario = await iniciarCenario();
    t.after(async () => { servicoPerguntas.limparCache(); await cenario.encerrar(); });
    const { consultar, prisma } = cenario;
    const fundamental = { etapaEnsino: "FUNDAMENTAL", serie: 4, turma: "A" };
    const medio = { etapaEnsino: "MEDIO", serie: 2, turma: "B" };
    const perguntas = await consultar("/perguntas?turma=FUNDAMENTAL:4&turma=MEDIO:2");
    assert.equal(perguntas.status, 200);
    assert.equal(perguntas.dados.categoriaQuiz, "FUNDAMENTAL_1");
    assert.equal(perguntas.dados.total, 4, "não impõe quantidade fixa de específicas/comuns");
    assert.deepEqual(perguntas.dados.perguntas.map((item) => item.id), ["f1-a", "f1-b", "comum-a", "comum-b"]);
    assert.ok(perguntas.dados.perguntas.every((item) => item.tema === "História & Vida"));
    const dados = (chave, nomeEscola, turma, contextoQuiz = perguntas.dados.contextoQuiz) => ({
        idempotencyKey: chave, nomeEscola, cidade: "Quixadá", pontuacaoFinal: 275,
        contextoQuiz, turmas: [turma],
    });
    const primeira = await consultar("/sessao", dados("mista-escola-fund", "Escola Fundamental", fundamental));
    const segunda = await consultar("/sessao", dados("mista-escola-medio", "Escola Ensino Médio", medio));
    assert.deepEqual([primeira.status, segunda.status], [201, 201]);
    assert.equal(primeira.dados.partida.categoriaQuiz, "FUNDAMENTAL_1");
    assert.equal(segunda.dados.partida.categoriaQuiz, "FUNDAMENTAL_1");
    const repetida = await consultar("/sessao", dados("mista-escola-medio", "Escola Ensino Médio", medio));
    assert.equal(repetida.status, 200);
    assert.equal(repetida.dados.duplicada, true);
    assert.equal(await prisma.partida.count(), 2);
    assert.deepEqual((await prisma.partida.findMany()).map((item) => item.categoriaQuiz), ["FUNDAMENTAL_1", "FUNDAMENTAL_1"]);
    const rankingMisto = await consultar("/ranking-categoria/FUNDAMENTAL_1");
    assert.equal(rankingMisto.status, 200);
    assert.equal(rankingMisto.dados.total, 2);
    assert.ok(rankingMisto.dados.ranking.every((item) => item.pontuacaoTotal === 275 && item.quantidadePartidas === 1));
    assert.equal((await consultar("/ranking-categoria/MEDIO")).dados.total, 0);
    assert.equal((await consultar("/ranking-categoria/COMUM")).status, 400);
    const perguntasMedio = await consultar("/perguntas?turma=MEDIO:2");
    assert.equal(perguntasMedio.dados.categoriaQuiz, "MEDIO");
    assert.equal(perguntasMedio.dados.total, 3);
    const terceira = await consultar("/sessao", dados("medio-escola-solo", "Escola Ensino Médio", medio, perguntasMedio.dados.contextoQuiz));
    assert.equal(terceira.status, 201);
    assert.equal(terceira.dados.partida.categoriaQuiz, "MEDIO");
    assert.equal((await consultar("/ranking-categoria/FUNDAMENTAL_1")).dados.total, 2);
    const rankingMedio = (await consultar("/ranking-categoria/MEDIO")).dados;
    assert.equal(rankingMedio.total, 1);
    assert.equal(rankingMedio.ranking[0].pontuacaoTotal, 275);
    assert.equal((await consultar("/ranking-categoria/FUNDAMENTAL_2")).dados.total, 0);
    assert.equal((await consultar("/ranking-turmas")).dados.total, 2);
    const escolas = (await consultar("/ranking-escolas")).dados.ranking;
    assert.equal(escolas.find((item) => item.escolaId === segunda.dados.escola.id).pontuacaoTotal, 550);
    const interno = await consultar(`/ranking-interno/${segunda.dados.escola.id}`);
    assert.equal(interno.dados.ranking[0].pontuacaoTotal, 550);
});
