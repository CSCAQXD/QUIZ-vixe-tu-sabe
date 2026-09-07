const sessaoService = require(
    "../services/sessao.service"
);

function validarAno(valor) {
    if (valor === undefined) {
        return null;
    }

    const ano = Number(valor);

    if (
        !Number.isInteger(ano) ||
        ano < 2000 ||
        ano > 2100
    ) {
        const erro = new Error(
            "ano deve ser um número inteiro entre 2000 e 2100."
        );

        erro.statusCode = 400;

        throw erro;
    }

    return ano;
}

async function registrarSessoes(
    req,
    res,
    next
) {
    try {
        const resultado =
            await sessaoService.registrarSessoes(
                req.body
            );

        return res
            .status(
                resultado.duplicada
                    ? 200
                    : 201
            )
            .json(resultado);
    } catch (error) {
        next(error);
    }
}

async function buscarPartida(
    req,
    res,
    next
) {
    try {
        const resultado =
            await sessaoService.buscarPartidaPorId(
                req.params.id
            );

        return res.json(resultado);
    } catch (error) {
        next(error);
    }
}

async function listarPorEscola(
    req,
    res,
    next
) {
    try {
        const ano = validarAno(
            req.query.ano
        );

        const resultado =
            await sessaoService.listarPartidasPorEscola(
                req.params.escolaId,
                ano
            );

        return res.json(resultado);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registrarSessoes,
    buscarPartida,
    listarPorEscola,
};