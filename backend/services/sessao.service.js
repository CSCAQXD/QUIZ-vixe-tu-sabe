const prisma = require(
    "../config/prisma"
);

const escolaRepository = require(
    "../repositories/escola.repository"
);

const sessaoRepository = require(
    "../repositories/sessao.repository"
);

const { limpar } = require(
    "../utils/sanitize"
);

function formatarPartida(
    partida,
    duplicada = false
) {
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
            ano: partida.ano,
            dataPartida:
                partida.dataPartida,
        },
        escola: {
            id: partida.escola.id,
            nome: partida.escola.nome,
            cidade: partida.escola.cidade,
        },
        turmas:
            partida.participacoes.map(
                (participacao) => ({
                    id: participacao.id,
                    serie: participacao.serie,
                    turma: participacao.turma,
                })
            ),
    };
}

async function registrarSessoes(dados) {
    const partidaExistente =
        await sessaoRepository.buscarPorIdempotencyKey(
            dados.idempotencyKey
        );

    if (partidaExistente) {
        return formatarPartida(
            partidaExistente,
            true
        );
    }

    const nomeEscola = limpar(
        dados.nomeEscola
    );

    const cidade = limpar(
        dados.cidade
    );

    const turmas = dados.turmas.map(
        (turma) => ({
            serie: turma.serie,
            turma: limpar(turma.turma),
        })
    );

    try {
        const partida =
            await prisma.$transaction(
                async (transaction) => {
                    const escola =
                        await escolaRepository.buscarOuCriar(
                            nomeEscola,
                            cidade,
                            transaction
                        );

                    return sessaoRepository.criar(
                        {
                            idempotencyKey:
                                dados.idempotencyKey,
                            pontuacaoFinal:
                                dados.pontuacaoFinal,
                            ano: new Date()
                                .getFullYear(),
                            escolaId:
                                escola.id,
                            turmas,
                        },
                        transaction
                    );
                }
            );

        return formatarPartida(
            partida
        );
    } catch (error) {
        if (error.code === "P2002") {
            const partidaDuplicada =
                await sessaoRepository.buscarPorIdempotencyKey(
                    dados.idempotencyKey
                );

            if (partidaDuplicada) {
                return formatarPartida(
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
        await sessaoRepository.buscarPorId(
            id
        );

    if (!partida) {
        const erro = new Error(
            "Partida não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    return formatarPartida(
        partida
    );
}

async function listarPartidasPorEscola(
    escolaId,
    ano
) {
    const escola =
        await escolaRepository.buscarPorId(
            escolaId
        );

    if (!escola) {
        const erro = new Error(
            "Escola não encontrada."
        );

        erro.statusCode = 404;

        throw erro;
    }

    const partidas =
        await sessaoRepository.listarPorEscola(
            escolaId,
            ano
        );

    return {
        escola,
        ano: ano || null,
        partidas,
    };
}

module.exports = {
    registrarSessoes,
    buscarPartidaPorId,
    listarPartidasPorEscola,
};