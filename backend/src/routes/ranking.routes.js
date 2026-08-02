const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

function aplicarLimite(lista, req) {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    return limit ? lista.slice(0, limit) : lista;
}

// 1) RANKING GERAL DE TURMAS
router.get('/ranking-turmas', async (req, res) => {
    try {
        const rankingAgrupado = await prisma.sessao.groupBy({
        by: ['escolaId', 'serie', 'turma'],
        _sum: { pontuacao: true },
        orderBy: { _sum: { pontuacao: 'desc' } }
    });

    const escolas = await prisma.escola.findMany();

    const rankingFinal = rankingAgrupado.map(item => {
    const escola = escolas.find(e => e.id === item.escolaId);
    return {
        escola: escola ? escola.nome : "Escola Não Identificada",
        cidade: escola ? escola.cidade : "Desconhecida",
        serie: item.serie,
        turma: item.turma,
        pontuacaoTotal: item._sum.pontuacao
        };
    });

    res.json(aplicarLimite(rankingFinal, req));
    } catch (error) {
    console.error("Erro na rota /ranking-turmas:", error.message);
    res.status(500).json({ erro: "Erro ao compilar o ranking de turmas." });
    }
});

// 2) RANKING ENTRE ESCOLAS

router.get('/ranking-escolas', async (req, res) => {
    try {
    const sessoes = await prisma.sessao.findMany({
        select: { escolaId: true, grupoId: true, pontuacao: true }
    });

    const partidasUnicas = new Map();
    for (const s of sessoes) {
        const chave = `${s.escolaId}|||${s.grupoId}`;
        if (!partidasUnicas.has(chave)) {
            partidasUnicas.set(chave, { escolaId: s.escolaId, pontuacao: s.pontuacao });
        }
    }

    const totaisPorEscola = new Map();
    for (const { escolaId, pontuacao } of partidasUnicas.values()) {
        totaisPorEscola.set(escolaId, (totaisPorEscola.get(escolaId) || 0) + pontuacao);
    }

    const escolas = await prisma.escola.findMany();
    const rankingFinal = escolas
    .map(escola => ({
        escola: escola.nome,
        cidade: escola.cidade,
        pontuacaoTotal: totaisPorEscola.get(escola.id) || 0
    }))
    .filter(item => item.pontuacaoTotal > 0)
    .sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);

    res.json(aplicarLimite(rankingFinal, req));
    } catch (error) {
    console.error("Erro na rota /ranking-escolas:", error.message);
    res.status(500).json({ erro: "Erro ao compilar o ranking entre escolas." });
    }
});

// 3) RANKING INTERNO POR ESCOLA

router.get('/ranking-interno/:escolaId', async (req, res) => {
    try {
        const { escolaId } = req.params;

        const escola = await prisma.escola.findUnique({ where: { id: escolaId } });
        if (!escola) {
            return res.status(404).json({ erro: "Escola não encontrada." });
    }

    const rankingAgrupado = await prisma.sessao.groupBy({
        by: ['serie', 'turma'],
        where: { escolaId },
        _sum: { pontuacao: true },
        orderBy: { _sum: { pontuacao: 'desc' } }
    });

    const ranking = rankingAgrupado.map(item => ({
        serie: item.serie,
        turma: item.turma,
        pontuacaoTotal: item._sum.pontuacao
    }));

    res.json({ escola: escola.nome, cidade: escola.cidade, ranking });
    } catch (error) {
    console.error("Erro na rota /ranking-interno:", error.message);
    res.status(500).json({ erro: "Erro ao compilar o ranking interno da escola." });
    }
});

module.exports = router;