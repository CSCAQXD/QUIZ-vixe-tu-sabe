const crypto = require("crypto");

const escolaService = require("./escola.service");
const sessaoRepository = require("../repositories/sessao.repository");
const { limpar } = require("../utils/sanitize");

async function registrarSessoes(dados) {
    const {
        nomeEscola,
        cidade,
        pontuacaoOriginal,
    } = dados;

    const dicasUsadas = Number(dados.dicasUsadas ?? 0);

    const turmas =
        Array.isArray(dados.turmas) && dados.turmas.length > 0
        ? dados.turmas
        : [{ serie: dados.serie, turma: dados.turma }];

    if (!nomeEscola || !cidade) {
        const erro = new Error("Escola e cidade são obrigatórios.");
        erro.statusCode = 400;
        throw erro;
    }

    if (
        pontuacaoOriginal === undefined ||
        pontuacaoOriginal === null ||
        isNaN(Number(pontuacaoOriginal))
    ) {
        const erro = new Error(
            "pontuacaoOriginal é obrigatório e deve ser numérico."
        );
        erro.statusCode = 400;
        throw erro;
    }

    if (
        !Number.isInteger(dicasUsadas) ||
        dicasUsadas < 0 ||
        dicasUsadas > 3
    ) {
        const erro = new Error(
            "dicasUsadas deve ser um número inteiro entre 0 e 3."
        );
        erro.statusCode = 400;
        throw erro;
    }

    for (const t of turmas) {
        const serie = Number(t.serie);
        const turmaTratada = limpar(t.turma);

        if (!Number.isInteger(serie) || serie <= 0) {
            const erro = new Error(
                "Cada turma precisa ter uma série válida."
            );
            erro.statusCode = 400;
            throw erro;
        }

        if (!turmaTratada) {
            const erro = new Error(
                "Cada turma precisa ter o campo 'turma' preenchido."
            );
            erro.statusCode = 400;
            throw erro;
        }
    }

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
    const sessoesCriadas = [];

    for (const t of turmas) {
        const turmaTratada = limpar(t.turma);

        const sessao = await sessaoRepository.criar({
            escolaId: escola.id,
            serie: Number(t.serie),
            turma: turmaTratada,
            pontuacao: pontuacaoFinal,
            dicasUsadas,
            grupoId,
        });

        sessoesCriadas.push(sessao);
    }

    const todasSessoesDaEscola =
        await sessaoRepository.buscarTodasDaEscola(escola.id);

    const totaisPorTurma = new Map();

    for (const sessao of todasSessoesDaEscola) {
        const chave = `${sessao.serie}|||${sessao.turma}`;

        totaisPorTurma.set(
            chave,
            (totaisPorTurma.get(chave) || 0) + sessao.pontuacao
        );
    }

    const rankingInterno = [...totaisPorTurma.entries()]
        .map(([chave, total]) => {
            const [serie, turma] = chave.split("|||");

            return {
                serie: Number(serie),
                turma,
                pontuacaoTotal: total,
            };
        })
        .sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

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
            pontuacaoAcumuladaNaEscola: totaisPorTurma.get(
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
