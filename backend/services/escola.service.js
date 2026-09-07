const escolaRepository = require(
    "../repositories/escola.repository"
);

async function listarEscolas() {
    return escolaRepository
        .buscarTodas();
}

module.exports = {
    listarEscolas,
};