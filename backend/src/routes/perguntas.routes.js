const express = require('express');
const axios = require('axios');
const Papa = require('papaparse');

const router = express.Router();
const CSV_URL = process.env.PERGUNTAS_CSV_URL;

router.get('/perguntas', async (req, res) => {
if (!CSV_URL) {
    return res.status(500).json({
    erro: "PERGUNTAS_CSV_URL não configurada. Adicione essa variável no seu .env."
    });
}

    try {
    const resposta = await axios.get(CSV_URL);

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

module.exports = router;
