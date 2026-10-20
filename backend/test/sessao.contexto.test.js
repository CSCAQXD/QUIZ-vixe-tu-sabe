const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");
const prisma = require("../config/prisma");
const escolaRepository = require("../repositories/escola.repository");
const sessaoRepository = require("../repositories/sessao.repository");
const rankingService = require("../services/ranking.service");
const sessaoService = require("../services/sessao.service");
const { criarContextoQuiz } = require("../utils/contextoQuiz");

test.afterEach(() => mock.restoreAll());
const escola = { id: "e1", nome: "Escola Modelo", cidade: "Quixadá" };
const turmaMedio = { etapaEnsino: "MEDIO", serie: 2, turma: "A" };
const clienteOriginal = Object.getPrototypeOf(prisma._originalClient);

test("salva categoria assinada do quiz misto sem recalculá-la pela escola isolada", async () => {
    const { contextoQuiz } = criarContextoQuiz([
        { etapaEnsino: "FUNDAMENTAL", serie: 4 },
        turmaMedio,
    ]);
    mock.method(sessaoRepository, "buscarPorIdempotencyKey", async () => null);
    mock.method(escolaRepository, "buscarOuCriar", async () => escola);
    mock.method(clienteOriginal, "$transaction", async (operacao) => operacao({}));
    mock.method(rankingService, "listarRankingInterno", async () => ({ ranking: [], total: 0 }));
    const criar = mock.method(sessaoRepository, "criar", async (dados) => ({
        ...dados,
        id: "p1",
        escola,
        participacoes: dados.turmas,
    }));
    const resultado = await sessaoService.registrarSessoes({
        nomeEscola: escola.nome,
        cidade: escola.cidade,
        turmas: [turmaMedio],
        idempotencyKey: "chave-partida-teste",
        pontuacaoFinal: 100,
        contextoQuiz,
        categoriaQuiz: "MEDIO",
    });
    assert.equal(criar.mock.calls[0].arguments[0].categoriaQuiz, "FUNDAMENTAL_1");
    assert.equal(resultado.partida.categoriaQuiz, "FUNDAMENTAL_1");
});

test("recusa contexto inválido antes de iniciar gravações", async () => {
    mock.method(sessaoRepository, "buscarPorIdempotencyKey", async () => null);
    const transacao = mock.method(clienteOriginal, "$transaction", async () => assert.fail());
    await assert.rejects(
        () =>
            sessaoService.registrarSessoes({
                idempotencyKey: "partida-nova",
                contextoQuiz: "invalido.assinatura",
                turmas: [turmaMedio],
            }),
        (erro) => erro.statusCode === 400,
    );
    assert.equal(transacao.mock.callCount(), 0);
});

test("repositório persiste categoria e histórico preserva partidas legadas sem classificação", async () => {
    let dadosCriados;
    await sessaoRepository.criar(
        { categoriaQuiz: "MEDIO", turmas: [turmaMedio] },
        {
            partida: {
                create: async ({ data }) => {
                    dadosCriados = data;
                    return data;
                },
            },
        },
    );
    assert.equal(dadosCriados.categoriaQuiz, "MEDIO");
    mock.method(escolaRepository, "buscarPorId", async () => escola);
    mock.method(sessaoRepository, "listarPorEscola", async () => [
        { id: "legada", participacoes: [turmaMedio] },
        { id: "nova", categoriaQuiz: "MEDIO", participacoes: [turmaMedio] },
    ]);
    const historico = await sessaoService.listarPartidasPorEscola("e1", 2026);
    assert.deepEqual(
        historico.partidas.map((item) => item.categoriaQuiz),
        [null, "MEDIO"],
    );
});
