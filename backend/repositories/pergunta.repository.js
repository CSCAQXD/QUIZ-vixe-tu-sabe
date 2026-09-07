const axios = require("axios");
const Papa = require("papaparse");

const CSV_URL = process.env.PERGUNTAS_CSV_URL;

async function buscarDaPlanilha() {
    if (!CSV_URL) {
        const erro = new Error(
        "PERGUNTAS_CSV_URL não configurada. Adicione essa variável no seu .env."
        );
        erro.statusCode = 500;
        throw erro;
    }

    const resposta = await axios.get(CSV_URL);

    const resultados = Papa.parse(resposta.data, {
        header: true,
        skipEmptyLines: true,
    });

    return resultados.data;
}

module.exports = {
    buscarDaPlanilha,
};