function validar(schema) {
    if (
        typeof schema !==
        "function"
    ) {
        throw new TypeError(
            "O schema de validação deve ser uma função."
        );
    }

    return (req, res, next) => {
        try {
            req.body = schema(
                req.body
            );

            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = validar;