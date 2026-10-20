const escolaService = require("../services/escola.service");
const escolaCatalogoService = require("../services/escolaCatalogo.service");

async function listarEscolas(req, res, next) {
    try {
        const escolas = await escolaService.listarEscolas();

        return res.json({
            total: escolas.length,
            escolas,
        });
    } catch (error) {
        next(error);
    }
}

async function buscarCatalogo(req, res, next) {
    try {
        const resultado = await escolaCatalogoService.buscarEscolas({
            municipioIbgeId: req.query.municipioIbgeId,
            termo: req.query.q,
            limite: req.query.limit === undefined ? 8 : Number(req.query.limit),
        });

        return res.json(resultado);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    buscarCatalogo,
    listarEscolas,
};
