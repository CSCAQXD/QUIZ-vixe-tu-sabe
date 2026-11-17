require("dotenv").config({ path: require("node:path").resolve(__dirname, "..", ".env") });

const prisma = require("../config/prisma");
const { resolverDatabaseUrl } = require("../config/databaseUrl");
const { normalizarTurma, obterIdentidadeCurso } = require("../utils/identidadeCadastro");
const { chaveEntidade } = require("../utils/sanitize");

const PREFIXO = "teste-ranking-organizado";
const confirmouDesenvolvimento = process.argv.includes("--confirm-development");
const argumentoAno = process.argv.find((argumento) => argumento.startsWith("--ano="));
const ano = argumentoAno ? Number(argumentoAno.split("=")[1]) : new Date().getFullYear();

const escolas = [
    {
        nome: "ESCOLA TESTE CAMINHOS DO SERTÃO",
        cidade: "Quixadá",
        turmas: [
            { etapaEnsino: "FUNDAMENTAL", serie: 5, turma: "A", pontos: [820, 760] },
            { etapaEnsino: "FUNDAMENTAL", serie: 4, turma: "B", pontos: [690, 710] },
        ],
    },
    {
        nome: "ESCOLA TESTE RAÍZES DO CEARÁ",
        cidade: "Quixadá",
        turmas: [
            { etapaEnsino: "FUNDAMENTAL", serie: 9, turma: "A", pontos: [920, 880] },
            { etapaEnsino: "FUNDAMENTAL", serie: 7, turma: "B", pontos: [740, 780] },
        ],
    },
    {
        nome: "ESCOLA TESTE CORDEL E TECNOLOGIA",
        cidade: "Quixadá",
        turmas: [
            {
                etapaEnsino: "MEDIO",
                serie: 1,
                turma: "A",
                cursoNome: "Informática",
                pontos: [980, 1020],
            },
            {
                etapaEnsino: "MEDIO",
                serie: 2,
                turma: "B",
                cursoNome: "Administração",
                pontos: [860, 900],
            },
        ],
    },
];

function validarDestino() {
    const databaseUrl = resolverDatabaseUrl(process.env.DATABASE_URL);
    if (!confirmouDesenvolvimento) {
        throw new Error("Confirme o banco local com --confirm-development.");
    }
    if (process.env.NODE_ENV === "production") {
        throw new Error("Este script não pode ser executado em produção.");
    }
    if (!databaseUrl.startsWith("file:")) {
        throw new Error("Este script aceita somente um banco SQLite local.");
    }
    if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
        throw new Error("Informe um ano válido com --ano=AAAA.");
    }
}

function categoriaDaTurma(turma) {
    if (turma.etapaEnsino === "MEDIO") return "MEDIO";
    return turma.serie <= 5 ? "FUNDAMENTAL_1" : "FUNDAMENTAL_2";
}

async function substituirDadosDeTeste() {
    validarDestino();
    const prefixoDoAno = `${PREFIXO}-${ano}-`;

    const resultado = await prisma.$transaction(async (transaction) => {
        const partidasAnteriores = await transaction.partida.findMany({
            where: { idempotencyKey: { startsWith: prefixoDoAno } },
            select: { id: true },
        });
        const idsAnteriores = partidasAnteriores.map(({ id }) => id);
        if (idsAnteriores.length > 0) {
            await transaction.participacao.deleteMany({
                where: { partidaId: { in: idsAnteriores } },
            });
            await transaction.partida.deleteMany({ where: { id: { in: idsAnteriores } } });
        }

        let quantidadePartidas = 0;
        let quantidadeTurmas = 0;

        for (const [indiceEscola, dadosEscola] of escolas.entries()) {
            const escola = await transaction.escola.upsert({
                where: {
                    nome_cidade: { nome: dadosEscola.nome, cidade: dadosEscola.cidade },
                },
                update: {},
                create: {
                    nome: dadosEscola.nome,
                    cidade: dadosEscola.cidade,
                    cidadeUf: `${dadosEscola.cidade} - CE`,
                    nomeBusca: chaveEntidade(dadosEscola.nome, true),
                    cidadeBusca: chaveEntidade(dadosEscola.cidade),
                },
            });

            for (const [indiceTurma, turma] of dadosEscola.turmas.entries()) {
                const cursoBusca = obterIdentidadeCurso(turma.cursoNome);
                let cursoId = null;
                if (turma.cursoNome) {
                    const curso = await transaction.curso.upsert({
                        where: {
                            escolaId_nomeBusca: { escolaId: escola.id, nomeBusca: cursoBusca },
                        },
                        update: { nome: turma.cursoNome },
                        create: {
                            escolaId: escola.id,
                            nome: turma.cursoNome,
                            nomeBusca: cursoBusca,
                        },
                    });
                    cursoId = curso.id;
                }

                quantidadeTurmas += 1;
                for (const [indicePartida, pontuacaoFinal] of turma.pontos.entries()) {
                    const partida = await transaction.partida.create({
                        data: {
                            idempotencyKey: `${prefixoDoAno}${indiceEscola + 1}-${indiceTurma + 1}-${indicePartida + 1}`,
                            pontuacaoFinal,
                            categoriaQuiz: categoriaDaTurma(turma),
                            ano,
                            dataPartida: new Date(
                                Date.UTC(ano, 2 + indicePartida, 10 + indiceTurma),
                            ),
                            escolaId: escola.id,
                        },
                    });
                    await transaction.participacao.create({
                        data: {
                            etapaEnsino: turma.etapaEnsino,
                            serie: turma.serie,
                            turma: turma.turma,
                            turmaBusca: normalizarTurma(turma.turma),
                            cursoId,
                            cursoBusca,
                            partidaId: partida.id,
                        },
                    });
                    quantidadePartidas += 1;
                }
            }
        }

        return {
            escolas: escolas.length,
            turmas: quantidadeTurmas,
            partidas: quantidadePartidas,
        };
    });

    console.log(
        `Dados de teste de ${ano} criados: ${resultado.escolas} escolas, ${resultado.turmas} turmas e ${resultado.partidas} partidas.`,
    );
}

substituirDadosDeTeste()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
