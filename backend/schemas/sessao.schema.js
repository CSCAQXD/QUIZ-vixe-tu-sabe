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

    const idempotencyKey = String(
        dados.idempotencyKey ?? ""
    ).trim();

    const pontuacaoFinal = Number(
        dados.pontuacaoFinal
    );

    const turmasRecebidas =
        Array.isArray(dados.turmas) &&
        dados.turmas.length > 0
            ? dados.turmas
            : [
                    {
                        etapaEnsino:
                            dados.etapaEnsino,
                        serie: dados.serie,
                        turma: dados.turma,
                    },
                ];

    if (!nomeEscola) {
        throw criarErroValidacao(
            "O nome da escola é obrigatório."
        );
    }

    if (nomeEscola.length < 3 || nomeEscola.length > 200) {
        throw criarErroValidacao(
            "O nome da escola deve possuir pelo menos 3 e no máximo 200 caracteres."
        );
    }

    if (!cidade) {
        throw criarErroValidacao(
            "A cidade é obrigatória."
        );
    }

    if (cidade.length < 3 || cidade.length > 120) {
        throw criarErroValidacao(
            "A cidade deve possuir pelo menos 3 e no máximo 120 caracteres."
        );
    }

    if (
        idempotencyKey.length < 8 ||
        idempotencyKey.length > 100
    ) {
        throw criarErroValidacao(
            "idempotencyKey deve possuir entre 8 e 100 caracteres."
        );
    }

    if (
        !Number.isInteger(pontuacaoFinal) ||
        pontuacaoFinal < 0
    ) {
        throw criarErroValidacao(
            "pontuacaoFinal deve ser um número inteiro maior ou igual a zero."
        );
    }

    if (turmasRecebidas.length > 20) {
        throw criarErroValidacao(
            "Uma partida pode possuir no máximo 20 turmas."
        );
    }

    const identificadores = new Set();

    const turmas = turmasRecebidas.map(
        (item, indice) => {
            const etapaEnsino = String(
                item?.etapaEnsino ?? "FUNDAMENTAL"
            ).trim().toUpperCase();

            const serie = Number(
                item?.serie
            );

            const turma = String(
                item?.turma ?? ""
            ).trim();

            if (!["FUNDAMENTAL", "MEDIO"].includes(etapaEnsino)) {
                throw criarErroValidacao(
                    `A etapa de ensino da turma ${indice + 1} deve ser FUNDAMENTAL ou MEDIO.`
                );
            }

            const serieMaxima = etapaEnsino === "MEDIO" ? 3 : 9;

            if (
                !Number.isInteger(serie) ||
                serie < 1 ||
                serie > serieMaxima
            ) {
                throw criarErroValidacao(
                    `A série da turma ${indice + 1} deve ser um número inteiro entre 1 e ${serieMaxima} para a etapa informada.`
                );
            }

            if (
                turma.length < 1 ||
                turma.length > 30
            ) {
                throw criarErroValidacao(
                    `O nome da turma ${indice + 1} deve possuir entre 1 e 30 caracteres.`
                );
            }

            const identificador =
                `${etapaEnsino}|||${serie}|||${turma.toUpperCase()}`;

            if (
                identificadores.has(
                    identificador
                )
            ) {
                throw criarErroValidacao(
                    "Não é permitido repetir a mesma série e turma na partida."
                );
            }

            identificadores.add(
                identificador
            );

            return {
                etapaEnsino,
                serie,
                turma,
            };
        }
    );

    return {
        nomeEscola,
        cidade,
        idempotencyKey,
        pontuacaoFinal,
        turmas,
    };
}

module.exports = {
    validarSessao,
};
