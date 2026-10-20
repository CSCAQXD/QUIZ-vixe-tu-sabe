const prisma = require(
    "../config/prisma"
);

const escolaRepository = require(
    "../repositories/escola.repository"
);
const cursoService = require("./curso.service");
const escolaCatalogoService = require("./escolaCatalogo.service");
const { validarContextoQuiz } = require("../utils/contextoQuiz");

const sessaoRepository = require(
    "../repositories/sessao.repository"
);

const rankingService = require(
    "./ranking.service"
);

const {
    chaveEntidade,
    limpar,
} = require("../utils/sanitize");
const {
    CURSO_REGULAR,
    encontrarTurmaDuplicada,
    normalizarTurma,
    obterIdentidadeCurso,
} = require("../utils/identidadeCadastro");

function chaveRankingTurma(item) {
    return [
        item.etapaEnsino || "FUNDAMENTAL",
        item.serie,
        item.cursoBusca || obterIdentidadeCurso(item.cursoNome),
        item.turmaBusca || normalizarTurma(item.turma),
    ].join("|||");
}

async function montarResultado(
    partida,
    duplicada = false
) {
    const rankingInterno =
        await rankingService.listarRankingInterno(
            partida.escola.id,
            partida.ano,
            null
        );

    const rankingPorTurma = new Map(
        rankingInterno.ranking.map((item) => [
            chaveRankingTurma(item),
            item,
        ])
    );

    const turmas =
        partida.participacoes.map(
            (participacao) => {
                const itemRanking =
                    rankingPorTurma.get(
                        chaveRankingTurma({
                            ...participacao,
                            cursoNome: participacao.curso?.nome,
                        })
                    );

                return {
                    id: participacao.id,
                    etapaEnsino:
                        participacao.etapaEnsino,
                    serie:
                        participacao.serie,
                    turma:
                        participacao.turma,
                    cursoId: participacao.cursoId || null,
                    cursoNome: participacao.curso?.nome || null,
                    pontuacaoDaRodada:
                        partida.pontuacaoFinal,
                    pontuacaoAcumulada:
                        itemRanking
                            ?.pontuacaoTotal || 0,
                    posicaoRankingInterno:
                        itemRanking
                            ?.posicao || null,
                    totalTurmasNoRankingInterno:
                        rankingInterno.total,
                };
            }
        );

    return {
        mensagem: duplicada
            ? "Esta partida já havia sido registrada."
            : "Partida registrada com sucesso.",

        duplicada,

        partida: {
            id: partida.id,
            idempotencyKey:
                partida.idempotencyKey,
            pontuacaoFinal:
                partida.pontuacaoFinal,
            categoriaQuiz: partida.categoriaQuiz ?? null,
            ano: partida.ano,
            dataPartida:
                partida.dataPartida,
        },

        escola: {
            id: partida.escola.id,
            nome: partida.escola.nome,
            cidade:
                partida.escola.cidade,
            cidadeUf: partida.escola.cidadeUf || null,
            municipioIbgeId: partida.escola.municipioIbgeId || null,
            codigoInep: partida.escola.codigoInep || null,
        },

        turmas,
    };
}

async function registrarSessoes(dados) {
    const partidaExistente =
        await sessaoRepository
            .buscarPorIdempotencyKey(
                dados.idempotencyKey
            );

    if (partidaExistente) {
        return montarResultado(
            partidaExistente,
            true
        );
    }

    const categoriaQuiz = validarContextoQuiz(dados.contextoQuiz, dados.turmas);

    const turmaDuplicada = encontrarTurmaDuplicada(dados.turmas);
    if (turmaDuplicada) {
        const erro = new Error(
            "Não é permitido repetir a mesma etapa, série, curso e turma na partida."
        );
        erro.statusCode = 400;
        throw erro;
    }

    let nomeEscola =
        limpar(dados.nomeEscola);

    const cidade =
        limpar(dados.cidade);

    const cidadeBusca =
        chaveEntidade(cidade);

    const cidadeUf = String(dados.cidadeUf ?? "").trim().toUpperCase();
    const municipioIbgeId = String(dados.municipioIbgeId ?? "").trim();
    let codigoInep = String(dados.codigoInep ?? "").trim();

    if (!codigoInep && municipioIbgeId) {
        const escolaOficial = await escolaCatalogoService.buscarCorrespondenciaExata({
            municipioIbgeId,
            nome: nomeEscola,
        });

        if (escolaOficial) {
            codigoInep = escolaOficial.codigoInep;
            nomeEscola = limpar(escolaOficial.nome);
        }
    }

    const nomeBusca =
        chaveEntidade(nomeEscola, true);

    const turmas =
        dados.turmas.map(
            (turma) => ({
                etapaEnsino:
                    turma.etapaEnsino,
                serie: turma.serie,
                turma: limpar(
                    turma.turma
                ),
                turmaBusca: normalizarTurma(turma.turma),
                cursoNome: turma.cursoNome
                    ? String(turma.cursoNome).trim().replace(/\s+/g, " ")
                    : undefined,
                cursoBusca: obterIdentidadeCurso(turma.cursoNome),
            })
        );

    const anoAtual =
        new Date().getFullYear();

    try {
        const partida =
            await prisma.$transaction(
                async (transaction) => {
                    const escola =
                        await escolaRepository
                            .buscarOuCriar(
                                nomeEscola,
                                cidade,
                                nomeBusca,
                                cidadeBusca,
                                cidadeUf,
                                municipioIbgeId,
                                codigoInep,
                                transaction
                            );

                    const cursosPorIdentidade = new Map();
                    const turmasComCurso = [];

                    for (const turma of turmas) {
                        if (turma.cursoBusca === CURSO_REGULAR) {
                            turmasComCurso.push({ ...turma, cursoId: null });
                            continue;
                        }

                        let curso = cursosPorIdentidade.get(turma.cursoBusca);
                        if (!curso) {
                            curso = await cursoService.resolver(
                                escola.id,
                                turma.cursoNome,
                                transaction
                            );
                            cursosPorIdentidade.set(turma.cursoBusca, curso);
                        }

                        turmasComCurso.push({
                            ...turma,
                            cursoBusca: curso.nomeBusca,
                            cursoId: curso.id,
                        });
                    }

                    return sessaoRepository
                        .criar(
                            {
                                idempotencyKey:
                                    dados.idempotencyKey,

                                pontuacaoFinal:
                                    dados.pontuacaoFinal,
                                categoriaQuiz,

                                ano: anoAtual,

                                escolaId:
                                    escola.id,

                                turmas: turmasComCurso,
                            },
                            transaction
                        );
                }
            );

        return montarResultado(
            partida
        );
    } catch (error) {
        if (error.code === "P2002") {
            const partidaDuplicada =
                await sessaoRepository
                    .buscarPorIdempotencyKey(
                        dados.idempotencyKey
                    );

            if (partidaDuplicada) {
                return montarResultado(
                    partidaDuplicada,
                    true
                );
            }
        }

        throw error;
    }
}

async function buscarPartidaPorId(id) {
    const partida =
        await sessaoRepository
            .buscarPorId(id);

    if (!partida) {
        const erro = new Error(
            "Partida não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    return montarResultado(
        partida
    );
}

async function listarPartidasPorEscola(
    escolaId,
    ano
) {
    const escola =
        await escolaRepository
            .buscarPorId(escolaId);

    if (!escola) {
        const erro = new Error(
            "Escola não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    const partidas =
        await sessaoRepository
            .listarPorEscola(
                escolaId,
                ano
            );

    const historico =
        partidas.map((partida) => ({
            id: partida.id,
            idempotencyKey:
                partida.idempotencyKey,
            pontuacaoFinal:
                partida.pontuacaoFinal,
            categoriaQuiz: partida.categoriaQuiz ?? null,
            ano: partida.ano,
            dataPartida:
                partida.dataPartida,
            turmas:
                partida.participacoes.map(
                    (participacao) => ({
                        id:
                            participacao.id,
                        etapaEnsino:
                            participacao.etapaEnsino,
                        serie:
                            participacao.serie,
                        turma:
                            participacao.turma,
                        cursoId: participacao.cursoId || null,
                        cursoNome: participacao.curso?.nome || null,
                    })
                ),
        }));

    return {
        escola,
        ano: ano || null,
        total: historico.length,
        partidas: historico,
    };
}

module.exports = {
    registrarSessoes,
    buscarPartidaPorId,
    listarPartidasPorEscola,
};
