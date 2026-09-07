const escolaRepository = require("../repositories/escola.repository");

async function listarEscolas() {
    return escolaRepository.buscarTodas();
}

async function buscarOuCriarEscola(nome, cidade) {
    const escolaExistente =
        await escolaRepository.buscarPorNomeECidade(nome, cidade);

    if (escolaExistente) {
        return escolaExistente;
    }

    return escolaRepository.criar({
        nome,
        cidade,
    });
}

module.exports = {
    listarEscolas,
    buscarOuCriarEscola,
};