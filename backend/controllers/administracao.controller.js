const administracaoService = require("../services/administracao.service");

function obterAno(valor) {
    const ano = valor === undefined ? new Date().getFullYear() : Number(valor);
    if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
        const erro = new Error("O ano deve ser um número inteiro entre 2000 e 2100.");
        erro.statusCode = 400;
        throw erro;
    }
    return ano;
}

async function exportarRankings(req, res, next) {
    try {
        const ano = obterAno(req.query.ano);
        const arquivo = await administracaoService.exportarRankings(ano);
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="vixe-tu-sabe-rankings-${ano}.xlsx"`,
        );
        return res.status(200).send(arquivo);
    } catch (error) {
        return next(error);
    }
}

async function reiniciarRankings(req, res, next) {
    try {
        const ano = obterAno(req.body?.ano);
        const removidos = await administracaoService.reiniciarRankings({
            ano,
            confirmacao: req.body?.confirmacao,
            senhaAdministrativa: req.body?.senhaAdministrativa,
        });
        return res.status(200).json({
            mensagem: `Os dados de ${ano} foram apagados.`,
            ano,
            removidos,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    exportarRankings,
    reiniciarRankings,
};
