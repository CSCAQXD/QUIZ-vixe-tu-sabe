const perguntaService = require("../services/pergunta.service");

const { criarContextoQuiz } = require("../utils/contextoQuiz");

async function listarPerguntas(req, res, next) {
    try {
        const turmas = lerTurmas(req.query.turma);
        const contexto = turmas.length ? criarContextoQuiz(turmas) : {};
        const perguntas = await perguntaService.listarPerguntas(turmas);

        res.setHeader("Cache-Control", turmas.length ? "private, no-store" : "public, max-age=60");

        return res.status(200).json({
            total: perguntas.length,
            perguntas,
            ...contexto,
        });
    } catch (error) {
        next(error);
    }
}

function resumirVersao(versao) {
    if (!versao) return null;
    const resumo = { ...versao };
    delete resumo.perguntas;
    return resumo;
}

async function obterStatus(req, res, next) {
    try {
        const status = await perguntaService.obterStatus();
        return res.status(200).json({
            ativa: resumirVersao(status.ativa),
            versoes: status.versoes.map(resumirVersao),
        });
    } catch (error) {
        return next(error);
    }
}

async function validarAtualizacao(req, res, next) {
    try {
        const resultado = await perguntaService.validarAtualizacao();
        return res.status(200).json({
            ...resultado,
            versao: resumirVersao(resultado.versao),
        });
    } catch (error) {
        return next(error);
    }
}

async function ativarVersao(req, res, next) {
    try {
        const versao = await perguntaService.ativarVersao(req.params.id);
        return res.status(200).json({
            mensagem: "Versão de perguntas ativada com sucesso.",
            versao: resumirVersao(versao),
        });
    } catch (error) {
        return next(error);
    }
}

function lerTurmas(parametro) {
    if (!parametro) return [];

    const valores = Array.isArray(parametro) ? parametro : [parametro];

    if (valores.length > 100) {
        const erro = new Error("Uma mediação pode possuir no máximo 100 turmas.");
        erro.statusCode = 400;
        throw erro;
    }

    return valores.map((valor) => {
        const [etapaEnsino, serieTexto] = String(valor).split(":");
        const serie = Number(serieTexto);
        const limite = etapaEnsino === "MEDIO" ? 3 : 9;

        if (
            typeof valor !== "string" ||
            !/^(FUNDAMENTAL:[1-9]|MEDIO:[1-3])$/.test(valor) ||
            !["FUNDAMENTAL", "MEDIO"].includes(etapaEnsino) ||
            !Number.isInteger(serie) ||
            serie < 1 ||
            serie > limite
        ) {
            const erro = new Error("A turma informada é inválida.");
            erro.statusCode = 400;
            throw erro;
        }

        return { etapaEnsino, serie };
    });
}

module.exports = {
    ativarVersao,
    listarPerguntas,
    obterStatus,
    validarAtualizacao,
};
