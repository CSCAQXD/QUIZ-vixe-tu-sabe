const axios = require("axios");
const Papa = require("papaparse");

function obterConfiguracao() {
    const csvUrl =
        process.env.PERGUNTAS_CSV_URL;

    const timeoutMs =
        Number(
            process.env
                .PERGUNTAS_TIMEOUT_MS
        ) || 5000;

    if (!csvUrl) {
        const erro = new Error(
            "PERGUNTAS_CSV_URL não está configurada."
        );

        erro.statusCode = 500;

        throw erro;
    }

    return {
        csvUrl,
        timeoutMs,
    };
}

async function buscarDaPlanilha() {
    const {
        csvUrl,
        timeoutMs,
    } = obterConfiguracao();

    let resposta;

    try {
        resposta = await axios.get(
            csvUrl,
            {
                timeout: timeoutMs,
                responseType: "text",
                maxContentLength:
                    2 * 1024 * 1024,
                headers: {
                    Accept:
                        "text/csv,text/plain",
                },
            }
        );
    } catch (error) {
        const erro = new Error(
            "Não foi possível consultar a planilha de perguntas."
        );

        erro.statusCode = 503;
        erro.cause = error;

        throw erro;
    }

    if (
        typeof resposta.data !==
        "string"
    ) {
        const erro = new Error(
            "A planilha retornou um conteúdo inválido."
        );

        erro.statusCode = 502;

        throw erro;
    }

    const resultado = Papa.parse(
        resposta.data,
        {
            header: true,
            skipEmptyLines: "greedy",
            transformHeader: (
                cabecalho
            ) => cabecalho.trim(),
        }
    );

    const errosRelevantes =
        resultado.errors.filter(
            (erro) =>
                erro.type !==
                "FieldMismatch"
        );

    if (
        errosRelevantes.length > 0
    ) {
        const erro = new Error(
            "A planilha contém um CSV inválido."
        );

        erro.statusCode = 502;

        throw erro;
    }

    if (
        !Array.isArray(
            resultado.data
        )
    ) {
        const erro = new Error(
            "A planilha não contém perguntas válidas."
        );

        erro.statusCode = 502;

        throw erro;
    }

    return resultado.data;
}

module.exports = {
    buscarDaPlanilha,
};