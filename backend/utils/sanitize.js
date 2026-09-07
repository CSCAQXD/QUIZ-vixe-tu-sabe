function limpar(valor) {
    if (
        typeof valor !== "string"
    ) {
        return valor;
    }

    return valor
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleUpperCase(
            "pt-BR"
        );
}

module.exports = {
    limpar,
};