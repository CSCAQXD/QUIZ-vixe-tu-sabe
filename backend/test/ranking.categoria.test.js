const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");
const repository = require("../repositories/ranking.repository");
const service = require("../services/ranking.service");
const controller = require("../controllers/ranking.controller");

test.afterEach(() => mock.restoreAll());

function participacao(escolaId, serie, pontos, id, etapaEnsino = "MEDIO") {
    return { etapaEnsino, serie, turma: "A", partida: { id, pontuacaoFinal: pontos,
        escola: { id: escolaId, nome: `Escola ${escolaId}`, cidade: "Quixadá" } } };
}

test("consulta categoria da partida sem filtrar pela série da participação", async () => {
    let consulta;
    const cliente = { participacao: { findMany: async (opcoes) => { consulta = opcoes; return []; } } };
    await repository.buscarParticipacoes(2026, null, "FUNDAMENTAL_1", cliente);
    assert.deepEqual(consulta.where, { partida: { ano: 2026, categoriaQuiz: "FUNDAMENTAL_1" } });
    await repository.buscarParticipacoes(2026, "e1", null, cliente);
    assert.deepEqual(consulta.where, { partida: { ano: 2026, escolaId: "e1" } });
});

test("agrega todas as turmas da categoria jogada, inclusive médio em mediação mista", async () => {
    const buscar = mock.method(repository, "buscarParticipacoes", async () => [
        participacao("A", 2, 60, "p1"), participacao("A", 2, 40, "p2"),
        participacao("B", 4, 100, "p3", "FUNDAMENTAL"), participacao("C", 1, 80, "p4"),
    ]);
    const resultado = await service.listarRankingPorCategoria("FUNDAMENTAL_1", 2026, 2);
    assert.deepEqual(buscar.mock.calls[0].arguments, [2026, null, "FUNDAMENTAL_1"]);
    assert.equal(resultado.categoria, "FUNDAMENTAL_1");
    assert.equal(resultado.total, 3);
    assert.deepEqual(resultado.ranking.map((item) => item.posicao), [1, 1]);
    assert.equal(resultado.ranking[0].etapaEnsino, "MEDIO");
    assert.equal(resultado.ranking[0].quantidadePartidas, 2);
});

test("rejeita categorias inválidas sem acessar dados", async () => {
    const buscar = mock.method(repository, "buscarParticipacoes", async () => []);
    for (const categoria of ["TODAS", "fundamental_1", "MEDIO ", null]) {
        await assert.rejects(() => service.listarRankingPorCategoria(categoria, 2026, null),
            (erro) => erro.statusCode === 400);
    }
    assert.equal(buscar.mock.callCount(), 0);
});

test("ranking por categoria respeita ano e limite padrão e validados", async () => {
    const listar = mock.method(service, "listarRankingPorCategoria", async () => ({ ranking: [] }));
    const res = { json: (resultado) => resultado };
    await controller.listarRankingPorCategoria({ params: { categoria: "MEDIO" }, query: {} }, res, assert.fail);
    assert.deepEqual(listar.mock.calls[0].arguments, ["MEDIO", new Date().getFullYear(), null]);
    for (const query of [{ ano: 1999 }, { limit: 101 }]) {
        let erro;
        await controller.listarRankingPorCategoria({ params: { categoria: "MEDIO" }, query }, res,
            (falha) => { erro = falha; });
        assert.equal(erro.statusCode, 400);
    }
});
