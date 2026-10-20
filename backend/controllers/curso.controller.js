const cursoService = require("../services/curso.service");

async function listar(req, res, next) {
    try {
        const cursos = await cursoService.listar(req.params.escolaId);
        return res.json({ cursos, total: cursos.length });
    } catch (error) {
        return next(error);
    }
}

async function cadastrar(req, res, next) {
    try {
        const curso = await cursoService.cadastrar(
            req.params.escolaId,
            req.body.nome,
            req.body.confirmar === true,
        );
        return res.status(201).json({ curso });
    } catch (error) {
        return next(error);
    }
}

module.exports = { cadastrar, listar };
