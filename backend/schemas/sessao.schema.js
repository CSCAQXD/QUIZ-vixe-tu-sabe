function criarErroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.statusCode = 400;

    return erro;
}

function validarSessao(dados = {}) {
    const {
        nomeEscola,
        cidade,
        pontuacaoOriginal,
    } = dados;

    const dicasUsadas = Number(dados.dicasUsadas ?? 0);

    const turmas =
        Array.isArray(dados.turmas) && dados.turmas.length > 0
            ? dados.turmas
            : [{ serie: dados.serie, turma: dados.turma }];

    if (!nomeEscola || !cidade) {
        throw criarErroValidacao(
            "Escola e cidade são obrigatórios."
        );
    }

    if (
        pontuacaoOriginal === undefined ||
        pontuacaoOriginal === null ||
        isNaN(Number(pontuacaoOriginal))
    ) {
        throw criarErroValidacao(
            "pontuacaoOriginal é obrigatório e deve ser numérico."
        );
    }

    if (
        !Number.isInteger(dicasUsadas) ||
        dicasUsadas < 0 ||
        dicasUsadas > 3
    ) {
        throw criarErroValidacao(
            "dicasUsadas deve ser um número inteiro entre 0 e 3."
        );
    }

    for (const turma of turmas) {
        const serie = Number(turma.serie);

        if (!Number.isInteger(serie) || serie <= 0) {
            throw criarErroValidacao(
                "Cada turma precisa ter uma série válida."
            );
        }

        if (!turma.turma || !String(turma.turma).trim()) {
            throw criarErroValidacao(
                "Cada turma precisa ter o campo 'turma' preenchido."
            );
        }
    }

    return {
        dicasUsadas,
        turmas,
    };
}

module.exports = {
    validarSessao,
};