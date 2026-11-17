const { timingSafeEqual } = require("node:crypto");
const ExcelJS = require("exceljs");

const administracaoRepository = require("../repositories/administracao.repository");
const rankingService = require("./ranking.service");

const CATEGORIAS = [
    ["FUNDAMENTAL_1", "Fundamental I"],
    ["FUNDAMENTAL_2", "Fundamental II"],
    ["MEDIO", "Ensino Médio"],
];

const CORES = {
    vinho: "FF3C1423",
    vermelho: "FFA52D37",
    laranja: "FFF09B32",
    areia: "FFF7C181",
    creme: "FFFFF8EF",
    cremeAlternado: "FFFFF0DF",
    branco: "FFFFFFFF",
    textoSecundario: "FF6C5960",
    linha: "FFE8D5C2",
    ouro: "FFFFD166",
    prata: "FFE7E7E7",
    bronze: "FFE8B27A",
};

const CORES_ABAS = [CORES.vermelho, CORES.laranja, CORES.ouro, CORES.areia, CORES.vinho];

const COLUNAS_TURMAS = [
    { campo: "posicao", titulo: "Posição", largura: 11, numero: true },
    { campo: "escola", titulo: "Escola", largura: 34 },
    { campo: "cidade", titulo: "Cidade", largura: 22 },
    { campo: "serieFormatada", titulo: "Série", largura: 30 },
    { campo: "cursoNome", titulo: "Curso", largura: 28 },
    { campo: "turma", titulo: "Turma", largura: 14 },
    { campo: "quantidadePartidas", titulo: "Partidas", largura: 12, numero: true },
    { campo: "pontuacaoTotal", titulo: "Pontuação", largura: 14, numero: true },
];

const COLUNAS_ESCOLAS = [
    { campo: "posicao", titulo: "Posição", largura: 11, numero: true },
    { campo: "escola", titulo: "Escola", largura: 38 },
    { campo: "cidade", titulo: "Cidade", largura: 24 },
    { campo: "quantidadePartidas", titulo: "Partidas", largura: 12, numero: true },
    { campo: "pontuacaoTotal", titulo: "Pontuação", largura: 14, numero: true },
];

function criarAba(workbook, nome, titulo, ano, colunas, registros) {
    const aba = workbook.addWorksheet(nome, {
        views: [{ state: "frozen", ySplit: 4 }],
        properties: {
            defaultRowHeight: 21,
            tabColor: { argb: CORES_ABAS[workbook.worksheets.length % CORES_ABAS.length] },
        },
        pageSetup: {
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: { left: 0.3, right: 0.3, top: 0.45, bottom: 0.45, header: 0.2, footer: 0.2 },
        },
    });
    const ultimaColuna = aba.getColumn(colunas.length).letter;

    aba.mergeCells(`A1:${ultimaColuna}1`);
    aba.getCell("A1").value = titulo;
    aba.getCell("A1").font = { name: "Arial", size: 18, bold: true, color: { argb: CORES.vinho } };
    aba.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: CORES.areia } };
    aba.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };
    aba.getRow(1).height = 34;

    aba.mergeCells(`A2:${ultimaColuna}2`);
    aba.getCell("A2").value = `Vixe, Tu Sabe? · Rankings de ${ano}`;
    aba.getCell("A2").font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: CORES.vermelho },
    };
    aba.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: CORES.creme } };
    aba.getCell("A2").alignment = { vertical: "middle" };
    aba.getRow(2).height = 24;

    aba.mergeCells(`A3:${ultimaColuna}3`);
    aba.getCell("A3").value = "Casa de Saberes Cego Aderaldo";
    aba.getCell("A3").font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: CORES.textoSecundario },
    };
    aba.getCell("A3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: CORES.creme } };

    aba.columns = colunas.map(({ campo, largura }) => ({ key: campo, width: largura }));
    const cabecalho = aba.getRow(4);
    cabecalho.values = colunas.map(({ titulo: rotulo }) => rotulo);
    cabecalho.height = 24;
    cabecalho.eachCell((celulaCabecalho) => {
        celulaCabecalho.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: CORES.branco },
        };
        celulaCabecalho.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: CORES.vermelho },
        };
        celulaCabecalho.alignment = { horizontal: "center", vertical: "middle" };
        celulaCabecalho.border = {
            right: { style: "thin", color: { argb: CORES.branco } },
            bottom: { style: "medium", color: { argb: CORES.vinho } },
        };
    });

    for (const registro of registros) {
        const linha = aba.addRow(
            Object.fromEntries(colunas.map(({ campo }) => [campo, registro[campo] ?? ""])),
        );
        linha.font = { name: "Arial", size: 10, color: { argb: CORES.vinho } };
        linha.alignment = { vertical: "middle" };
        linha.height = 23;
        linha.eachCell((celulaDados) => {
            celulaDados.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: linha.number % 2 === 0 ? CORES.creme : CORES.cremeAlternado },
            };
            celulaDados.border = { bottom: { style: "thin", color: { argb: CORES.linha } } };
        });

        const posicao = Number(registro.posicao);
        const corPodio =
            posicao === 1
                ? CORES.ouro
                : posicao === 2
                  ? CORES.prata
                  : posicao === 3
                    ? CORES.bronze
                    : null;
        if (corPodio) {
            const celulaPosicao = linha.getCell("posicao");
            celulaPosicao.fill = { type: "pattern", pattern: "solid", fgColor: { argb: corPodio } };
            celulaPosicao.font = {
                name: "Arial",
                size: 11,
                bold: true,
                color: { argb: CORES.vinho },
            };
        }
    }

    for (const { campo, numero } of colunas) {
        if (numero) aba.getColumn(campo).numFmt = "#,##0";
    }
    aba.getColumn("posicao").alignment = { horizontal: "center", vertical: "middle" };
    aba.getColumn("quantidadePartidas").alignment = { horizontal: "center", vertical: "middle" };
    aba.getColumn("pontuacaoTotal").alignment = { horizontal: "right", vertical: "middle" };
    aba.autoFilter = { from: "A4", to: `${ultimaColuna}4` };
    aba.headerFooter.oddFooter = `&L&8Vixe, Tu Sabe?&C&8${titulo}&R&8Página &P de &N`;
    return aba;
}

function adicionarPosicoesInternas(turmas) {
    const porEscola = new Map();

    for (const turma of turmas) {
        const grupo = porEscola.get(turma.escolaId) || [];
        grupo.push(turma);
        porEscola.set(turma.escolaId, grupo);
    }

    const resultado = [];
    for (const grupo of porEscola.values()) {
        grupo.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);
        let posicao = 0;
        let pontuacaoAnterior = null;
        for (const turma of grupo) {
            if (turma.pontuacaoTotal !== pontuacaoAnterior) {
                posicao += 1;
                pontuacaoAnterior = turma.pontuacaoTotal;
            }
            resultado.push({ ...turma, posicao });
        }
    }

    return resultado.sort((a, b) =>
        a.escola.localeCompare(b.escola, "pt-BR", { sensitivity: "base" }),
    );
}

async function exportarRankings(ano) {
    const [turmas, escolas, ...categorias] = await Promise.all([
        rankingService.listarRankingDeTurmas(ano, null),
        rankingService.listarRankingDeEscolas(ano, null),
        ...CATEGORIAS.map(([categoria]) =>
            rankingService.listarRankingPorCategoria(categoria, ano, null),
        ),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Casa de Saberes Cego Aderaldo";
    workbook.company = "Casa de Saberes Cego Aderaldo";
    workbook.subject = `Rankings do quiz Vixe, Tu Sabe? de ${ano}`;
    workbook.title = `Rankings Vixe, Tu Sabe? ${ano}`;
    workbook.created = new Date();

    criarAba(workbook, "Turmas", "Ranking geral de turmas", ano, COLUNAS_TURMAS, turmas.ranking);
    criarAba(workbook, "Escolas", "Ranking entre escolas", ano, COLUNAS_ESCOLAS, escolas.ranking);
    categorias.forEach((resultado, indice) => {
        criarAba(
            workbook,
            CATEGORIAS[indice][1],
            `Ranking ${CATEGORIAS[indice][1]}`,
            ano,
            COLUNAS_TURMAS,
            resultado.ranking,
        );
    });
    criarAba(
        workbook,
        "Interno por escola",
        "Ranking interno por escola",
        ano,
        COLUNAS_TURMAS,
        adicionarPosicoesInternas(turmas.ranking),
    );

    return Buffer.from(await workbook.xlsx.writeBuffer());
}

function compararSegredo(recebido, esperado) {
    const primeiro = Buffer.from(String(recebido || ""));
    const segundo = Buffer.from(String(esperado || ""));
    return primeiro.length === segundo.length && timingSafeEqual(primeiro, segundo);
}

async function reiniciarRankings({ ano, confirmacao, senhaAdministrativa }) {
    const fraseEsperada = `APAGAR DADOS DE ${ano}`;
    if (confirmacao !== fraseEsperada) {
        const erro = new Error(`Digite exatamente: ${fraseEsperada}`);
        erro.statusCode = 400;
        throw erro;
    }

    if (!compararSegredo(senhaAdministrativa, process.env.PERGUNTAS_ADMIN_TOKEN)) {
        const erro = new Error("Senha administrativa inválida.");
        erro.statusCode = 401;
        throw erro;
    }

    return administracaoRepository.limparSessoesDoAno(ano);
}

module.exports = {
    exportarRankings,
    reiniciarRankings,
};
