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
