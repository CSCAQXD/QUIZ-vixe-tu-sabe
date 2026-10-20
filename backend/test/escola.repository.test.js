const test = require("node:test");
const assert = require("node:assert/strict");
const escolaRepository = require("../repositories/escola.repository");

test("reutiliza escola encontrada pela identidade normalizada", async () => {
    const escola = { id: "e1", nome: "EEEP JÚLIO FRANÇA" };
    let dadosCriacao;
    const cliente = {
        escola: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where.OR[0], {
                    nomeBusca: "JULIO FRANCA",
                    cidadeBusca: "QUIXADA",
                });
                return escola;
            },
            create: async ({ data }) => {
                dadosCriacao = data;
                return data;
            },
        },
    };

    const resultado = await escolaRepository.buscarOuCriar(
        "JULIO FRANCA",
        "QUIXADÁ",
        "JULIO FRANCA",
        "QUIXADA",
        cliente,
    );

    assert.equal(resultado, escola);
    assert.equal(dadosCriacao, undefined);
});

test("reconhece escola antiga mesmo com acento e prefixo diferentes", async () => {
    const escola = {
        id: "e1",
        nome: "EEEP Júlio França",
        cidade: "Quixadá",
    };
    let atualizacao;
    const cliente = {
        escola: {
            findFirst: async () => null,
            findMany: async () => [escola],
            update: async (dados) => {
                atualizacao = dados;
                return { ...escola, ...dados.data };
            },
            create: async () => assert.fail("não deve duplicar a escola"),
        },
    };

    const resultado = await escolaRepository.buscarOuCriar(
        "JULIO FRANCA",
        "QUIXADA",
        "JULIO FRANCA",
        "QUIXADA",
        cliente,
    );

    assert.equal(resultado.id, escola.id);
    assert.deepEqual(atualizacao, {
        where: { id: escola.id },
        data: { nomeBusca: "JULIO FRANCA", cidadeBusca: "QUIXADA" },
    });
});

test("associa a escola já cadastrada pela identidade e pelo município", async () => {
    const escola = {
        id: "e1",
        nome: "JÚLIO FRANÇA",
        nomeBusca: "JULIO FRANCA",
        cidade: "Quixadá",
        cidadeBusca: "QUIXADA",
        municipioIbgeId: "2311306",
        codigoInep: null,
    };
    const cliente = {
        escola: {
            findFirst: async ({ where }) => {
                assert.deepEqual(where.OR[0], {
                    nomeBusca: "JULIO FRANCA",
                    municipioIbgeId: "2311306",
                });
                return escola;
            },
        },
    };

    const resultado = await escolaRepository.buscarOuCriar(
        "EEEP JULIO FRANCA",
        "QUIXADÁ",
        "JULIO FRANCA",
        "QUIXADA",
        "CE",
        "2311306",
        "",
        cliente,
    );

    assert.equal(resultado.id, escola.id);
});
