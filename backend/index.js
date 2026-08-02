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

// Rota inteligente para processar e registrar as sessões de jogo
app.post('/sessao', async (req, res) => {
    try {
        console.log("Dados recebidos no body:", req.body);
        
        const { nomeEscola, cidade, serie, turma, pontuacaoOriginal, dicasUsadas } = req.body;

        if (!nomeEscola || !cidade || !serie || !turma) {
            return res.status(400).json({ erro: "Escola, cidade, série e turma são obrigatórios." });
        }

        // SANITIZAÇÃO: Limpa os textos removendo espaços nas pontas e padronizando em maiúsculo
        const nomeEscolaTratado = nomeEscola.trim().toUpperCase();
        const cidadeTratada = cidade.trim().toUpperCase();
        const turmaTratada = turma.trim().toUpperCase();

        // 1ª ETAPA: Verificar se a escola já existe pelo nome único
        let esco = await prisma.escola.findUnique({
            where: { nome: nomeEscolaTratado }
        });

        // 2ª ETAPA: Se for uma escola nova, cadastra de forma transparente
        if (!esco) {
            console.log(`Nova escola detectada! Cadastrando: ${nomeEscolaTratado}`);
            esco = await prisma.escola.create({
                data: {
                    nome: nomeEscolaTratado,
                    cidade: cidadeTratada
                }
            });
        }

        // 3ª ETAPA: Cálculo dinâmico do desconto de dicas
        const desconto = dicasUsadas ? (dicasUsadas * 0.20) : 0;
        const pontuacaoCalculada = pontuacaoOriginal * (1 - desconto);
        const pontuacaoFinal = Math.max(0, Math.round(pontuacaoCalculada));
        
        // 4ª ETAPA: Grava a rodada no histórico vinculando ao ID seguro da escola
        const novaSessao = await prisma.sessao.create({
            data: {
                escolaId: esco.id,
                serie: parseInt(serie),
                turma: turmaTratada,
                pontuacao: pontuacaoFinal 
            }
        });

        res.status(201).json({ 
            mensagem: "Sessão e dados escolares processados com sucesso!", 
            id: novaSessao.id,
            escola: esco.nome
        });

    } catch (error) {
        console.error("ERRO DETALHADO NO PROCESSAMENTO DA SESSÃO:", error);
        res.status(500).json({ erro: "Erro ao processar e salvar a sessão.", detalhe: error.message });
    }
});

// ROTA DE RANKING: Agrupa e soma os pontos para o ranking geral de turmas
app.get('/ranking-turmas', async (req, res) => {
    try {
        // O Prisma junta as linhas idênticas de escola, série e turma e faz a soma matemática rápida
        const rankingAgrupado = await prisma.sessao.groupBy({
            by: ['escolaId', 'serie', 'turma'],
            _sum: {
                pontuacao: true
            },
            orderBy: {
                _sum: {
                    pontuacao: 'desc'
                }
            }
        });

        // Busca a lista de escolas para injetar o nome e a cidade reais no retorno do JSON
        const escolas = await prisma.escola.findMany();
        
        const rankingFinal = rankingAgrupado.map(item => {
            const escolaEncontrada = escolas.find(e => e.id === item.escolaId);
            return {
                escola: escolaEncontrada ? escolaEncontrada.nome : "Escola Não Identificada",
                cidade: escolaEncontrada ? escolaEncontrada.cidade : "Desconhecida",
                serie: item.serie,
                turma: item.turma,
                pontuacaoTotal: item._sum.pontuacao // Pontuação somada de todas as visitas!
            };
        });

        res.status(200).json(rankingFinal);
    } catch (error) {
        console.error("Erro na rota /ranking-turmas:", error.message);
        res.status(500).json({ erro: "Erro ao compilar o ranking de turmas." });
    }
});

// --- LIGAR O SERVIDOR ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});