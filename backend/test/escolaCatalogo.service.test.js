const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buscarCorrespondenciaExata,
    buscarNoCatalogo,
} = require("../services/escolaCatalogo.service");

const ESCOLAS = [
    {
        codigoInep: "23000001",
        nome: "EEEP MARIA MODELO",
        nomeBusca: "EEEP MARIA MODELO",
        municipioIbgeId: "2311306",
        cidade: "Quixadá",
        uf: "CE",
        dependencia: "Estadual",
    },
    {
        codigoInep: "23000002",
        nome: "COLÉGIO JOSÉ DE ALENCAR",
        nomeBusca: "COLEGIO JOSE DE ALENCAR",
        municipioIbgeId: "2311306",
        cidade: "Quixadá",
        uf: "CE",
        dependencia: "Privada",
    },
];

test("busca escola sem diferenciar acentos e prioriza o início do nome", () => {
    assert.deepEqual(
        buscarNoCatalogo(ESCOLAS, "colegio jose", 8),
        [{
            codigoInep: "23000002",
            nome: "COLÉGIO JOSÉ DE ALENCAR",
            municipioIbgeId: "2311306",
            cidade: "Quixadá",
            uf: "CE",
            dependencia: "Privada",
        }]
    );
});

test("encontra por palavras parciais e respeita o limite", () => {
    assert.deepEqual(
        buscarNoCatalogo(ESCOLAS, "maria mod", 1).map((escola) => escola.codigoInep),
        ["23000001"]
    );
});

test("associa um nome equivalente a uma única escola oficial da cidade", async () => {
    const escola = await buscarCorrespondenciaExata({
        municipioIbgeId: "2311306",
        nome: "eeep maria cavalcante costa",
    });

    assert.equal(escola.codigoInep, "23232439");
    assert.equal(escola.nome, "EEEP MARIA CAVALCANTE COSTA");
});
