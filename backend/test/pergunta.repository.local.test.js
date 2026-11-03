const test = require("node:test");
const assert = require("node:assert/strict");
const repository = require("../repositories/pergunta.repository");

function registroPergunta(alteracoes = {}) {
    return {
        id: "registro-1",
        versaoId: "versao-1",
        idExterno: "PERGUNTA-1",
        ordem: 0,
        faixa: "FUNDAMENTAL_1",
        tema: "Tema",
        enunciado: "Enunciado?",
        altA: "A",
        altB: "B",
        altC: "C",
        altD: "D",
        correta: "A",
        pontosIniciais: 100,
        dica1: "Dica",
        dica2: null,
        dica3: null,
        ...alteracoes,
    };
}

test("mapeia a versão ativa do SQLite para o contrato do quiz", async () => {
    const cliente = {
        versaoPerguntas: {
            findFirst: async () => ({
                id: "versao-1",
                criadaEm: new Date("2026-11-03T10:00:00Z"),
                ativadaEm: new Date("2026-11-03T10:01:00Z"),
                status: "ATIVA",
                hash: "hash",
                total: 1,
                perguntas: [registroPergunta()],
            }),
        },
    };

    const versao = await repository.buscarVersaoAtiva(cliente);

    assert.equal(versao.perguntas[0].id, "PERGUNTA-1");
    assert.deepEqual(versao.perguntas[0].opcoes, ["A", "B", "C", "D"]);
    assert.deepEqual(versao.perguntas[0].dicas, ["Dica"]);
});

test("salva perguntas normalizadas como uma versão em rascunho", async () => {
    let dadosCriados;
    const cliente = {
        versaoPerguntas: {
            findUnique: async () => null,
            create: async ({ data }) => {
                dadosCriados = data;
                return {
                    id: "versao-1",
                    criadaEm: new Date(),
                    ativadaEm: null,
                    status: "RASCUNHO",
                    hash: data.hash,
                    total: data.total,
                    perguntas: [registroPergunta()],
                };
            },
        },
    };
    const pergunta = {
        id: "PERGUNTA-1",
        faixa: "FUNDAMENTAL_1",
        tema: "Tema",
        pergunta: "Enunciado?",
        opcoes: ["A", "B", "C", "D"],
        correta: "A",
        pontosIniciais: 100,
        dicas: ["Dica"],
    };

    const versao = await repository.salvarVersao([pergunta], "hash", cliente);

    assert.equal(versao.status, "RASCUNHO");
    assert.equal(dadosCriados.perguntas.create[0].idExterno, "PERGUNTA-1");
    assert.equal(dadosCriados.perguntas.create[0].dica2, null);
});

test("arquiva a versão anterior e ativa a versão escolhida numa transação", async () => {
    const operacoes = [];
    const transacao = {
        versaoPerguntas: {
            findUnique: async () => ({ id: "nova" }),
            updateMany: async (opcao) => operacoes.push(["arquivar", opcao]),
            update: async (opcao) => {
                operacoes.push(["ativar", opcao]);
                return {
                    id: "nova",
                    criadaEm: new Date(),
                    ativadaEm: new Date(),
                    status: "ATIVA",
                    hash: "hash",
                    total: 1,
                    perguntas: [registroPergunta()],
                };
            },
        },
    };
    const cliente = { $transaction: (executar) => executar(transacao) };

    const versao = await repository.ativarVersao("nova", cliente);

    assert.equal(versao.status, "ATIVA");
    assert.equal(operacoes[0][0], "arquivar");
    assert.equal(operacoes[1][0], "ativar");
});
