const express = require('express');
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { limpar } = require('../utils/sanitize');

const router = express.Router();

async function registrarSessoes(req, res) {
    try {
    const { nomeEscola, cidade, pontuacaoOriginal } = req.body;
    const dicasUsadas = Number(req.body.dicasUsadas ?? 0);

    const turmas = Array.isArray(req.body.turmas) && req.body.turmas.length > 0
        ? req.body.turmas
        : [{ serie: req.body.serie, turma: req.body.turma }];

    if (!nomeEscola || !cidade) {
        return res.status(400).json({ erro: "Escola e cidade são obrigatórios." });
    }
    if (pontuacaoOriginal === undefined || pontuacaoOriginal === null || isNaN(Number(pontuacaoOriginal))) {
        return res.status(400).json({ erro: "pontuacaoOriginal é obrigatório e deve ser numérico." });
    }
    if (isNaN(dicasUsadas) || dicasUsadas < 0) {
        return res.status(400).json({ erro: "dicasUsadas deve ser um número maior ou igual a 0." });
    }
    for (const t of turmas) {
        if (!t.serie || !t.turma) {
            return res.status(400).json({ erro: "Cada turma precisa dos campos 'serie' e 'turma' preenchidos." });
        }
    }

    const nomeEscolaTratado = limpar(nomeEscola);
    const cidadeTratada = limpar(cidade);

    let escola = await prisma.escola.findUnique({ where: { nome: nomeEscolaTratado } });
    if (!escola) {
        escola = await prisma.escola.create({
        data: { nome: nomeEscolaTratado, cidade: cidadeTratada }
        });
    }

    const desconto = dicasUsadas * 0.20;
    const pontuacaoCalculada = Number(pontuacaoOriginal) * (1 - desconto);
    const pontuacaoFinal = Math.max(0, Math.round(pontuacaoCalculada));
    const grupoId = crypto.randomUUID();

    const sessoesCriadas = [];
    for (const t of turmas) {
        const turmaTratada = limpar(t.turma);
        const sessao = await prisma.sessao.create({
            data: {
                escolaId: escola.id,
                serie: parseInt(t.serie),
                turma: turmaTratada,
                pontuacao: pontuacaoFinal,
                dicasUsadas,
                grupoId
            }
        });
        sessoesCriadas.push(sessao);
    }

    const todasSessoesDaEscola = await prisma.sessao.findMany({ where: { escolaId: escola.id } });

    const totaisPorTurma = new Map();
    for (const s of todasSessoesDaEscola) {
        const chave = `${s.serie}|||${s.turma}`;
        totaisPorTurma.set(chave, (totaisPorTurma.get(chave) || 0) + s.pontuacao);
    }

    const rankingInterno = [...totaisPorTurma.entries()]
        .map(([chave, total]) => {
            const [serie, turma] = chave.split('|||');
            return { serie: Number(serie), turma, pontuacaoTotal: total };
        })
        .sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

    const resultadoTurmas = turmas.map(t => {
        const serieNum = parseInt(t.serie);
        const turmaTratada = limpar(t.turma);
        const posicao = rankingInterno.findIndex(
            r => r.serie === serieNum && r.turma === turmaTratada
        ) + 1;

    return {
        serie: serieNum,
        turma: turmaTratada,
        pontuacaoDaRodada: pontuacaoFinal,
        pontuacaoAcumuladaNaEscola: totaisPorTurma.get(`${serieNum}|||${turmaTratada}`),
        posicaoRankingInterno: posicao,
        totalTurmasNoRankingInterno: rankingInterno.length
        };
    });

    res.status(201).json({
        mensagem: "Sessão(ões) registrada(s) com sucesso!",
        escola: { id: escola.id, nome: escola.nome, cidade: escola.cidade },
        grupoId,
        turmas: resultadoTurmas
    });

    } catch (error) {
        console.error("ERRO DETALHADO NO PROCESSAMENTO DA SESSÃO:", error);
        res.status(500).json({ erro: "Erro ao processar e salvar a sessão.", detalhe: error.message });
    }
}

router.post('/sessao', registrarSessoes);
router.post('/sessoes', registrarSessoes);

module.exports = router;
