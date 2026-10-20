const { LIMITE_CONTEXTO_QUIZ } = require("../utils/contextoQuiz");
const {
    buscarCursosCatalogoEquivalentes,
    encontrarTurmaDuplicada,
    normalizarCurso,
    normalizarTurma,
} = require("../utils/identidadeCadastro");
const { resolverMunicipio } = require("../utils/municipios");

function criarErroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.statusCode = 400;

    return erro;
}

function validarSessao(dados = {}) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        throw criarErroValidacao("O corpo da requisição deve ser um objeto JSON.");
    }

    const nomeEscola = String(dados.nomeEscola ?? "").trim();

    const cidade = String(dados.cidade ?? "").trim();

    const cidadeUf = String(dados.cidadeUf ?? "")
        .trim()
        .toUpperCase();

    const municipioIbgeId = String(dados.municipioIbgeId ?? "").trim();

    const codigoInep = String(dados.codigoInep ?? "").trim();

    const idempotencyKey = String(dados.idempotencyKey ?? "").trim();

    const contextoQuiz = typeof dados.contextoQuiz === "string" ? dados.contextoQuiz.trim() : "";

    const pontuacaoFinal = Number(dados.pontuacaoFinal);

    const turmasRecebidas =
        Array.isArray(dados.turmas) && dados.turmas.length > 0
            ? dados.turmas
            : [
                  {
                      etapaEnsino: dados.etapaEnsino,
                      serie: dados.serie,
                      turma: dados.turma,
                      cursoNome: dados.cursoNome,
                      tipoOrganizacao: dados.tipoOrganizacao,
                      organizacaoTurma: dados.organizacaoTurma,
                  },
              ];

    if (!nomeEscola) {
        throw criarErroValidacao("O nome da escola é obrigatório.");
    }

    if (nomeEscola.length < 3 || nomeEscola.length > 200) {
        throw criarErroValidacao(
            "O nome da escola deve possuir pelo menos 3 e no máximo 200 caracteres.",
        );
    }

    if (!cidade) {
        throw criarErroValidacao("A cidade é obrigatória.");
    }

    if (cidade.length < 3 || cidade.length > 120) {
        throw criarErroValidacao("A cidade deve possuir pelo menos 3 e no máximo 120 caracteres.");
    }

    const municipioResolvido = resolverMunicipio({
        cidade,
        cidadeUf,
        municipioIbgeId,
    });

    if (municipioResolvido.erro) {
        throw criarErroValidacao(municipioResolvido.erro);
    }

    const municipio = municipioResolvido.municipio;

    if (codigoInep && !/^\d{8}$/.test(codigoInep)) {
        throw criarErroValidacao("O código INEP da escola deve possuir 8 números.");
    }

    if (idempotencyKey.length < 8 || idempotencyKey.length > 100) {
        throw criarErroValidacao("idempotencyKey deve possuir entre 8 e 100 caracteres.");
    }

    if (!Number.isInteger(pontuacaoFinal) || pontuacaoFinal < 0) {
        throw criarErroValidacao(
            "pontuacaoFinal deve ser um número inteiro maior ou igual a zero.",
        );
    }

    if (
        contextoQuiz.length < 16 ||
        contextoQuiz.length > LIMITE_CONTEXTO_QUIZ ||
        !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(contextoQuiz)
    ) {
        throw criarErroValidacao(
            "O contexto do quiz é obrigatório. Inicie uma nova mediação para continuar.",
        );
    }

    if (turmasRecebidas.length > 20) {
        throw criarErroValidacao("Uma partida pode possuir no máximo 20 turmas.");
    }

    const turmas = turmasRecebidas.map((item, indice) => {
        const etapaEnsino = String(item?.etapaEnsino ?? "FUNDAMENTAL")
            .trim()
            .toUpperCase();

        const serie = Number(item?.serie);

        let turma = String(item?.turma ?? "")
            .trim()
            .replace(/\s+/g, " ");

        const cursoNome = String(item?.cursoNome ?? "")
            .trim()
            .replace(/\s+/g, " ");

        const tipoOrganizacaoRecebido = String(item?.tipoOrganizacao ?? "")
            .trim()
            .toUpperCase();

        const organizacaoTurmaRecebida = String(item?.organizacaoTurma ?? "")
            .trim()
            .toUpperCase();

        const tipoOrganizacao = tipoOrganizacaoRecebido || (cursoNome ? "TECNICA" : "REGULAR");

        const organizacaoTurma =
            organizacaoTurmaRecebida || (normalizarTurma(turma) === "UNICA" ? "UNICA" : "DIVIDIDA");

        if (!["FUNDAMENTAL", "MEDIO"].includes(etapaEnsino)) {
            throw criarErroValidacao(
                `A etapa de ensino da turma ${indice + 1} deve ser FUNDAMENTAL ou MEDIO.`,
            );
        }

        if (!["REGULAR", "TECNICA"].includes(tipoOrganizacao)) {
            throw criarErroValidacao(
                `O tipo de organização da turma ${indice + 1} deve ser REGULAR ou TECNICA.`,
            );
        }

        if (!["UNICA", "DIVIDIDA"].includes(organizacaoTurma)) {
            throw criarErroValidacao(
                `A organização da turma ${indice + 1} deve ser UNICA ou DIVIDIDA.`,
            );
        }

        if (tipoOrganizacao === "TECNICA" && !cursoNome) {
            throw criarErroValidacao(`Informe o curso profissionalizante da turma ${indice + 1}.`);
        }

        if (tipoOrganizacao === "REGULAR" && cursoNome) {
            throw criarErroValidacao(
                `A turma ${indice + 1} é regular e não deve possuir curso profissionalizante.`,
            );
        }

        if (organizacaoTurma === "UNICA") {
            turma = "UNICA";
        } else if (normalizarTurma(turma) === "UNICA") {
            throw criarErroValidacao(
                `Identifique a divisão da turma ${indice + 1}; DIVIDIDA não pode usar “Única”.`,
            );
        }

        const serieMaxima = etapaEnsino === "MEDIO" ? 3 : 9;

        if (!Number.isInteger(serie) || serie < 1 || serie > serieMaxima) {
            throw criarErroValidacao(
                `A série da turma ${indice + 1} deve ser um número inteiro entre 1 e ${serieMaxima} para a etapa informada.`,
            );
        }

        if (turma.length < 1 || turma.length > 30 || !normalizarTurma(turma)) {
            throw criarErroValidacao(
                `O nome da turma ${indice + 1} deve possuir entre 1 e 30 caracteres.`,
            );
        }

        const cursosCatalogo = cursoNome ? buscarCursosCatalogoEquivalentes(cursoNome) : [];

        if (cursosCatalogo.length > 1) {
            throw criarErroValidacao(
                `O curso da turma ${indice + 1} é ambíguo. Selecione uma opção da lista ou escreva o nome completo.`,
            );
        }

        if (
            cursoNome &&
            ((cursoNome.length < 3 && cursosCatalogo.length !== 1) ||
                cursoNome.length > 120 ||
                !normalizarCurso(cursoNome))
        ) {
            throw criarErroValidacao(
                `O curso da turma ${indice + 1} deve possuir entre 3 e 120 caracteres ou ser uma sigla reconhecida da lista.`,
            );
        }

        return {
            etapaEnsino,
            serie,
            turma,
            ...(cursoNome ? { cursoNome } : {}),
        };
    });

    const duplicada = encontrarTurmaDuplicada(turmas);
    if (duplicada) {
        throw criarErroValidacao(
            "Não é permitido repetir a mesma turma: " +
                `as turmas ${duplicada.primeiroIndice + 1} e ${duplicada.segundoIndice + 1} ` +
                "representam a mesma etapa, série, curso e divisão. Remova uma delas ou altere os dados.",
        );
    }

    return {
        nomeEscola,
        cidade: municipio.nome,
        cidadeUf: municipio.uf,
        ...(codigoInep ? { codigoInep } : {}),
        municipioIbgeId: municipio.id,
        idempotencyKey,
        pontuacaoFinal,
        contextoQuiz,
        turmas,
    };
}

module.exports = {
    validarSessao,
};
