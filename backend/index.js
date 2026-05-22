app.get('/perguntas', async (req, res) => {
    const urlPlanilha = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTsNj_z-lz_htrzuv0pbyFllv_z2cFNeRRvX-GUV2RPUEsx08TfUoSS24LjXZS3OML3O1f_yW-e-E6t/pub?output=csv";

    try {
        const resposta = await axios.get(urlPlanilha);
        
        const resultados = Papa.parse(resposta.data, {
            header: true,
            skipEmptyLines: true
        });
        console.log("Perguntas carregadas:", resultados.data.length);

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

