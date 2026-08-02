const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

router.get('/escolas', async (req, res) => {
    try {
        const escolas = await prisma.escola.findMany({ orderBy: { nome: 'asc' } });
        res.json(escolas);
    } catch (error) {
        console.error("Erro na rota /escolas:", error.message);
        res.status(500).json({ erro: "Erro ao listar as escolas." });
    }
});

module.exports = router;
