const perguntaRepository = require("../repositories/pergunta.repository");

function transformarPergunta(pergunta) {
    return {
        id: pergunta.id || "sem-id",
        pergunta: pergunta.pergunta || "Sem pergunta",
        opcoes: [
        pergunta.altA,
        pergunta.altB,
        pergunta.altC,
        pergunta.altD,
        ].filter((opcao) => opcao),
        correta: pergunta.correta,
        pontosIniciais: Number(pergunta.pontosIniciais) || 0,
        dicas: [
        pergunta.dica1,
        pergunta.dica2,
        pergunta.dica3,
        ].filter((dica) => dica && dica.trim() !== ""),
    };
}

async function listarPerguntas() {
    const perguntas = await perguntaRepository.buscarDaPlanilha();

    if (!perguntas || perguntas.length === 0) {
        const erro = new Error(
        "Nenhuma pergunta encontrada na planilha."
        );
        erro.statusCode = 404;
        throw erro;
    }

    return perguntas.map(transformarPergunta);
}

module.exports = {
    listarPerguntas,
};