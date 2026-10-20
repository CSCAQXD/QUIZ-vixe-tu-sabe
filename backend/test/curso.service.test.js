const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const cursoRepository = require("../repositories/curso.repository");
const escolaRepository = require("../repositories/escola.repository");
const cursoService = require("../services/curso.service");

test.afterEach(() => {
    mock.restoreAll();
});

test("preserva o nome usado pela escola e salva apenas a identidade canônica", async () => {
    mock.method(escolaRepository, "buscarPorId", async () => ({ id: "escola-1" }));
    mock.method(cursoRepository, "listarPorEscola", async () => []);
    const criar = mock.method(
        cursoRepository,
        "criar",
        async (escolaId, nome, nomeBusca) => ({ escolaId, nome, nomeBusca })
    );

    const curso = await cursoService.cadastrar(
        "escola-1",
        "Segurança da Informação"
    );

    assert.deepEqual(curso, {
        escolaId: "escola-1",
        nome: "Segurança da Informação",
        nomeBusca: "ciberseguranca",
    });
    assert.equal(criar.mock.callCount(), 1);
});

test("reutiliza curso existente em vez de criar o alias novamente", async () => {
    const existente = {
        id: "curso-1",
        nome: "Internet das Coisas",
        nomeBusca: "internet coisa",
    };
    mock.method(escolaRepository, "buscarPorId", async () => ({ id: "escola-1" }));
    mock.method(cursoRepository, "listarPorEscola", async () => [existente]);
    const criar = mock.method(
        cursoRepository,
        "criar",
        async () => assert.fail("não deve criar outro curso")
    );

    assert.equal(await cursoService.cadastrar("escola-1", "IoT"), existente);
    assert.equal(criar.mock.callCount(), 0);
});

test("recusa abreviação ambígua e informa as sugestões", async () => {
    await assert.rejects(
        () => cursoService.cadastrar("escola-1", "MEC"),
        (error) => {
            assert.equal(error.statusCode, 409);
            assert.match(error.message, /mais de um curso/);
            assert.ok(error.sugestoes.length > 1);
            return true;
        }
    );
});

test("mantém e cadastra um curso realmente novo", async () => {
    mock.method(escolaRepository, "buscarPorId", async () => ({ id: "escola-1" }));
    mock.method(cursoRepository, "listarPorEscola", async () => []);
    mock.method(
        cursoRepository,
        "criar",
        async (escolaId, nome, nomeBusca) => ({ escolaId, nome, nomeBusca })
    );

    assert.deepEqual(
        await cursoService.cadastrar("escola-1", "Tecnologia Subaquática"),
        {
            escolaId: "escola-1",
            nome: "Tecnologia Subaquática",
            nomeBusca: "tecnologia subaquatica",
        }
    );
});
