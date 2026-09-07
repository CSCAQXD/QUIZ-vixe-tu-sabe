const rankingRepository = require("../repositories/ranking.repository");

function aplicarLimite(lista, limit) {
    return limit ? lista.slice(0, limit) : lista;
}

async function listarRankingDeTurmas(limit) {
    const rankingAgrupado =
        await rankingRepository.buscarRankingDeTurmas();

    const escolas = await rankingRepository.buscarEscolas();

    const rankingFinal = rankingAgrupado.map((item) => {
        const escola = escolas.find(
        (escolaItem) => escolaItem.id === item.escolaId
        );

        return {
        escola: escola ? escola.nome : "Escola Não Identificada",
        cidade: escola ? escola.cidade : "Desconhecida",
        serie: item.serie,
        turma: item.turma,
        pontuacaoTotal: item._sum.pontuacao,
        };
    });

    return aplicarLimite(rankingFinal, limit);
}

async function listarRankingDeEscolas(limit) {
    const sessoes =
        await rankingRepository.buscarSessoesParaRankingDeEscolas();

    const partidasUnicas = new Map();

    for (const sessao of sessoes) {
        const chave = `${sessao.escolaId}|||${sessao.grupoId}`;

        if (!partidasUnicas.has(chave)) {
        partidasUnicas.set(chave, {
            escolaId: sessao.escolaId,
            pontuacao: sessao.pontuacao,
        });
        }
    }

    const totaisPorEscola = new Map();

    for (const { escolaId, pontuacao } of partidasUnicas.values()) {
        totaisPorEscola.set(
        escolaId,
        (totaisPorEscola.get(escolaId) || 0) + pontuacao
        );
    }

    const escolas = await rankingRepository.buscarEscolas();

    const rankingFinal = escolas
        .map((escola) => ({
        escola: escola.nome,
        cidade: escola.cidade,
        pontuacaoTotal: totaisPorEscola.get(escola.id) || 0,
        }))
        .filter((item) => item.pontuacaoTotal > 0)
        .sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

    return aplicarLimite(rankingFinal, limit);
}

async function listarRankingInterno(escolaId) {
    const escola =
        await rankingRepository.buscarEscolaPorId(escolaId);

    if (!escola) {
        const erro = new Error("Escola não encontrada.");
        erro.statusCode = 404;
        throw erro;
    }

    const rankingAgrupado =
        await rankingRepository.buscarRankingInterno(escolaId);

    const ranking = rankingAgrupado.map((item) => ({
        serie: item.serie,
        turma: item.turma,
        pontuacaoTotal: item._sum.pontuacao,
    }));

    return {
        escola: escola.nome,
        cidade: escola.cidade,
        ranking,
    };
}

module.exports = {
    listarRankingDeTurmas,
    listarRankingDeEscolas,
    listarRankingInterno,
};