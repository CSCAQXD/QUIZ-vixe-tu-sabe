function criarErroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.statusCode = 400;

    return erro;
}

function validarSessao(dados = {}) {
    if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
    ) {
        throw criarErroValidacao(
            "O corpo da requisição deve ser um objeto JSON."
        );
    }

    const nomeEscola = String(
        dados.nomeEscola ?? ""
    ).trim();

    const cidade = String(
        dados.cidade ?? ""
    ).trim();

    const temPontuacaoFinal =
        dados.pontuacaoFinal !== undefined &&
        dados.pontuacaoFinal !== null;

    const pontuacaoFinal = temPontuacaoFinal
        ? Number(dados.pontuacaoFinal)
        : null;

    const pontuacaoOriginal =
        dados.pontuacaoOriginal === undefined ||
        dados.pontuacaoOriginal === null
            ? null
            : Number(dados.pontuacaoOriginal);

    const dicasUsadas = Number(
        dados.dicasUsadas ?? 0
    );

    const entradaTurmas =
        Array.isArray(dados.turmas) &&
        dados.turmas.length > 0
            ? dados.turmas
            : [
                    {
                        serie: dados.serie,
                        turma: dados.turma,
                    },
                ];

    if (!nomeEscola || !cidade) {
        throw criarErroValidacao(
            "Escola e cidade são obrigatórios."
        );
    }

    if (
        temPontuacaoFinal &&
        (
            !Number.isFinite(pontuacaoFinal) ||
            pontuacaoFinal < 0
        )
    ) {
        throw criarErroValidacao(
            "pontuacaoFinal deve ser maior ou igual a zero."
        );
    }

    if (
        !temPontuacaoFinal &&
        (
            !Number.isFinite(pontuacaoOriginal) ||
            pontuacaoOriginal < 0
        )
    ) {
        throw criarErroValidacao(
            "Informe pontuacaoFinal ou uma pontuacaoOriginal válida."
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

    if (entradaTurmas.length > 20) {
        throw criarErroValidacao(
            "Uma partida pode registrar no máximo 20 turmas."
        );
    }

    const turmasUnicas = new Set();

    const turmas = entradaTurmas.map((item) => {
        const serie = Number(item?.serie);
        const turma = String(
            item?.turma ?? ""
        ).trim();

        if (
            !Number.isInteger(serie) ||
            serie <= 0
        ) {
            throw criarErroValidacao(
                "Cada turma precisa ter uma série válida."
            );
        }

        if (!turma) {
            throw criarErroValidacao(
                "Cada turma precisa ter o campo 'turma' preenchido."
            );
        }

        const chave = `${serie}|||${turma.toUpperCase()}`;

        if (turmasUnicas.has(chave)) {
            throw criarErroValidacao(
                "Não é permitido repetir a mesma série e turma."
            );
        }

        turmasUnicas.add(chave);

        return {
            serie,
            turma,
        };
    });

    return {
        nomeEscola,
        cidade,
        pontuacaoFinal,
        pontuacaoOriginal,
        dicasUsadas,
        turmas,
    };
}

module.exports = {
    validarSessao,
};