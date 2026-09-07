const axios = require("axios");
const Papa = require("papaparse");

const CSV_URL =
    process.env.PERGUNTAS_CSV_URL;

const TIMEOUT_MS =
    Number(
        process.env.PERGUNTAS_TIMEOUT_MS
    ) || 5000;

async function buscarDaPlanilha() {
    if (!CSV_URL) {
        const erro = new Error(
            "PERGUNTAS_CSV_URL não configurada."
        );

        erro.statusCode = 500;

        throw erro;
    }

    const resposta = await axios.get(
        CSV_URL,
        {
            timeout: TIMEOUT_MS,
            responseType: "text",
        }
    );

    const resultado = Papa.parse(
        resposta.data,
        {
            header: true,
            skipEmptyLines: true,
        }
    );

    if (resultado.errors.length > 0) {
        throw new Error(
            "A planilha contém dados CSV inválidos."
        );
    }

    return resultado.data;
}

module.exports = {
    buscarDaPlanilha,
};