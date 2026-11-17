const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");
const ExcelJS = require("exceljs");

const administracaoRepository = require("../repositories/administracao.repository");
const rankingService = require("../services/ranking.service");
const administracaoService = require("../services/administracao.service");

const turma = {
    posicao: 1,
    escolaId: "e1",
    escola: "Escola & Cultura",
    cidade: "Quixadá",
    serieFormatada: "9º ano — Ensino Fundamental",
    cursoNome: null,
    turma: "A",
    quantidadePartidas: 2,
    pontuacaoTotal: 180,
};

test.afterEach(() => {
    mock.restoreAll();
});

test("exporta uma planilha com uma aba para cada ranking", async () => {
    mock.method(rankingService, "listarRankingDeTurmas", async () => ({ ranking: [turma] }));
    mock.method(rankingService, "listarRankingDeEscolas", async () => ({
        ranking: [
            {
                posicao: 1,
                escola: turma.escola,
                cidade: turma.cidade,
                quantidadePartidas: 2,
                pontuacaoTotal: 180,
            },
        ],
    }));
    mock.method(rankingService, "listarRankingPorCategoria", async () => ({
        ranking: [turma],
    }));

    const arquivo = await administracaoService.exportarRankings(2026);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arquivo);

    const nomesEsperados = [
        "Turmas",
        "Escolas",
        "Fundamental I",
        "Fundamental II",
        "Ensino Médio",
        "Interno por escola",
    ];
    assert.deepEqual(
        workbook.worksheets.map((aba) => aba.name),
        nomesEsperados,
    );
    assert.equal(workbook.getWorksheet("Turmas").getCell("B5").value, "Escola & Cultura");
    assert.equal(workbook.getWorksheet("Turmas").getCell("H5").value, 180);
    assert.equal(workbook.getWorksheet("Turmas").views[0].state, "frozen");
    assert.equal(workbook.getWorksheet("Turmas").getCell("A4").fill.fgColor.argb, "FFA52D37");
    assert.equal(workbook.getWorksheet("Turmas").getCell("A5").fill.fgColor.argb, "FFFFD166");
    assert.equal(workbook.creator, "Casa de Saberes Cego Aderaldo");
});

test("reinicia somente o ano confirmado com a senha administrativa", async () => {
    const senhaAnterior = process.env.PERGUNTAS_ADMIN_TOKEN;
    process.env.PERGUNTAS_ADMIN_TOKEN = "senha-administrativa-segura";
    const limpar = mock.method(administracaoRepository, "limparSessoesDoAno", async () => ({
        partidas: 3,
        participacoes: 5,
    }));

    try {
        const resultado = await administracaoService.reiniciarRankings({
            ano: 2026,
            confirmacao: "APAGAR DADOS DE 2026",
            senhaAdministrativa: "senha-administrativa-segura",
        });

        assert.deepEqual(resultado, { partidas: 3, participacoes: 5 });
        assert.equal(limpar.mock.calls[0].arguments[0], 2026);
    } finally {
        if (senhaAnterior === undefined) delete process.env.PERGUNTAS_ADMIN_TOKEN;
        else process.env.PERGUNTAS_ADMIN_TOKEN = senhaAnterior;
    }
});

test("recusa reinicialização sem frase ou senha corretas", async () => {
    const senhaAnterior = process.env.PERGUNTAS_ADMIN_TOKEN;
    process.env.PERGUNTAS_ADMIN_TOKEN = "senha-administrativa-segura";
    mock.method(administracaoRepository, "limparSessoesDoAno", async () => ({}));

    try {
        await assert.rejects(
            () =>
                administracaoService.reiniciarRankings({
                    ano: 2026,
                    confirmacao: "APAGAR",
                    senhaAdministrativa: "senha-administrativa-segura",
                }),
            (erro) => erro.statusCode === 400,
        );
        await assert.rejects(
            () =>
                administracaoService.reiniciarRankings({
                    ano: 2026,
                    confirmacao: "APAGAR DADOS DE 2026",
                    senhaAdministrativa: "senha-incorreta",
                }),
            (erro) => erro.statusCode === 401,
        );
        assert.equal(administracaoRepository.limparSessoesDoAno.mock.callCount(), 0);
    } finally {
        if (senhaAnterior === undefined) delete process.env.PERGUNTAS_ADMIN_TOKEN;
        else process.env.PERGUNTAS_ADMIN_TOKEN = senhaAnterior;
    }
});
