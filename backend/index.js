require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- ROTAS PARA AS ESCOLAS ---

// 1. Cadastrar uma nova escola (Cadastro inicial)
app.post('/escolas', async (req, res) => {
    const { nome, cidade } = req.body;
    try {
        const novaEscola = await prisma.escola.create({
            data: { nome, cidade }
        });
        res.status(201).json(novaEscola);
    } catch (error) {
        res.status(400).json({ erro: "Essa escola já está cadastrada ou dados inválidos." });
    }
});

// 2. Listar todas as escolas (Para o mediador selecionar no formulário)
app.get('/escolas', async (req, res) => {
    const escolas = await prisma.escola.findMany({
        orderBy: { nome: 'asc' }
    });
    res.json(escolas);
});

// 3. Salvar o resultado de um quiz finalizado
app.post('/partidas', async (req, res) => {
    const { escolaId, nivel, turno, serie, turma, pontuacao } = req.body;
    try {
        const novaPartida = await prisma.partida.create({
        data: {
            escolaId,
            nivel,
            turno,
            serie: parseInt(serie),
            turma,
            pontuacao: parseInt(pontuacao)
        }
        });
        res.status(201).json(novaPartida);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: "Erro ao salvar a pontuação da partida." });
    }
});

// 4. Puxar o Ranking Geral (Top 10 para a Tela 6)
app.get('/ranking-geral', async (req, res) => {
    const ranking = await prisma.partida.findMany({
        include: { escola: true },
        orderBy: { pontuacao: 'desc' },
        take: 10
    });
    res.json(ranking);
});

const PORT = 3001; 
app.listen(PORT, () => {
    console.log(`Servidor da Casa de Saberes rodando em http://localhost:${PORT}`);
});