function validar(schema) {
    return (req, res, next) => {
        try {
            req.body = schema(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = validar;