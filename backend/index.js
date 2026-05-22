require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Rota para buscar perguntas na planilha
app.get('/perguntas', async (req, res) => {
    const urlPlanilha = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTsNj_z-lz_htrzuv0pbyFllv_z2cFNeRRvX-GUV2RPUEsx08TfUoSS24LjXZS3OML3O1f_yW-e-E6t/pub?output=csv";

    try {
        const resposta = await axios.get(urlPlanilha);
        
        const resultados = Papa.parse(resposta.data, {
            header: true,
            skipEmptyLines: true
        });

        if (!resultados.data || resultados.data.length === 0) {
            return res.status(404).json({ mensagem: "Nenhuma pergunta encontrada na planilha." });
        }

        const perguntas = resultados.data.map(p => ({
            id: p.id || "sem-id",
            pergunta: p.pergunta || "Sem pergunta",
            opcoes: [p.altA, p.altB, p.altC, p.altD].filter(opcao => opcao),
            correta: p.correta,
            pontosIniciais: Number(p.pontosIniciais) || 0,
            dicas: [p.dica1, p.dica2, p.dica3].filter(dica => dica && dica.trim() !== "")
        }));
        
        res.json(perguntas);
    } catch (error) {
        console.error("Erro na rota /perguntas:", error.message);
        res.status(500).json({ erro: "Erro ao buscar as perguntas na planilha.", detalhe: error.message });
    }
});

// Rota para salvar a Sessão e calcular a pontuação
app.post('/sessao', async (req, res) => {
    const { escolaId, serie, turma, pontuacaoOriginal, dicasUsadas } = req.body;

    if (!escolaId || !serie || !turma) {
        return res.status(400).json({ erro: "Escola, série e turma são obrigatórios." });
    }

    try {
        // Regra de negócio: Cada dica subtrai 20% do valor original (obs: eu vou arredondar esse valor, para melhorar a visualização no ranking)        
        const desconto = dicasUsadas * 0.20;
        const pontuacaoCalculada = pontuacaoOriginal * (1 - desconto);
        const pontuacaoFinal = Math.max(0, Math.round(pontuacaoCalculada));
        
        const novaSessao = await prisma.sessao.create({
            data: {
                escolaId,
                serie: parseInt(serie),
                turma: turma.trim().toUpperCase(),
                pontuacao: pontuacaoFinal 
            }
        });

        res.status(201).json({ mensagem: "Sessão salva com sucesso!", id: novaSessao.id, pontuacaoFinal });
    } catch (error) {
        console.error("Erro ao salvar sessão:", error.message);
        res.status(500).json({ erro: "Erro ao salvar sessão." });
    }
});

// --- LIGAR O SERVIDOR ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});