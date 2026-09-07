const escolaRepository = require("../repositories/escola.repository");

async function listarEscolas() {
    return escolaRepository.buscarTodas();
}

async function buscarOuCriarEscola(nome, cidade) {
    const escolaExistente = await escolaRepository.buscarPorNome(nome);

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