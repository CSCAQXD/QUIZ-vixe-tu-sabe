const crypto = require("crypto");

const escolaService = require("./escola.service");
const sessaoRepository = require("../repositories/sessao.repository");
const rankingRepository = require("../repositories/ranking.repository");

const { limpar } = require("../utils/sanitize");

async function registrarSessoes(dados) {
    const {
        nomeEscola,
        cidade,
        pontuacaoOriginal,
        dicasUsadas,
        turmas,
    } = dados;

    const nomeEscolaTratado = limpar(nomeEscola);
    const cidadeTratada = limpar(cidade);

    const escola = await escolaService.buscarOuCriarEscola(
        nomeEscolaTratado,
        cidadeTratada
    );

    const desconto = dicasUsadas * 0.2;

    const pontuacaoCalculada =
        Number(pontuacaoOriginal) * (1 - desconto);

    const pontuacaoFinal = Math.max(
        0,
        Math.round(pontuacaoCalculada)
    );

    const grupoId = crypto.randomUUID();

    for (const t of turmas) {
        const turmaTratada = limpar(t.turma);

        await sessaoRepository.criar({
            escolaId: escola.id,
            serie: Number(t.serie),
            turma: turmaTratada,
            pontuacao: pontuacaoFinal,
            dicasUsadas,
            grupoId,
        });
    }

    const rankingAgrupado =
        await rankingRepository.buscarRankingInterno(escola.id);

    const rankingInterno = rankingAgrupado.map((item) => ({
        serie: item.serie,
        turma: item.turma,
        pontuacaoTotal: item._sum.pontuacao,
    }));

    const pontuacoesPorTurma = new Map(
        rankingInterno.map((item) => [
            `${item.serie}|||${item.turma}`,
            item.pontuacaoTotal,
        ])
    );

    const resultadoTurmas = turmas.map((t) => {
        const serieNum = Number(t.serie);
        const turmaTratada = limpar(t.turma);

        const posicao =
            rankingInterno.findIndex(
                (ranking) =>
                    ranking.serie === serieNum &&
                    ranking.turma === turmaTratada
            ) + 1;

        return {
            serie: serieNum,
            turma: turmaTratada,
            pontuacaoDaRodada: pontuacaoFinal,
            pontuacaoAcumuladaNaEscola:
                pontuacoesPorTurma.get(
                    `${serieNum}|||${turmaTratada}`
                ),
            posicaoRankingInterno: posicao,
            totalTurmasNoRankingInterno: rankingInterno.length,
        };
    });

    return {
        mensagem: "Sessão(ões) registrada(s) com sucesso!",
        escola: {
            id: escola.id,
            nome: escola.nome,
            cidade: escola.cidade,
        },
        grupoId,
        turmas: resultadoTurmas,
    };
}

module.exports = {
    registrarSessoes,
};