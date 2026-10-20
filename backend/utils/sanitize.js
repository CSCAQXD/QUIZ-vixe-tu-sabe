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

function chaveEntidade(valor, removerPrefixoEscolar = false) {
    let chave = String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();

    if (removerPrefixoEscolar) {
        chave = chave
            .replace(
                /\b(?:[A-Z]\s+){1,}[A-Z]\b/g,
                (iniciais) => iniciais.replace(/\s+/g, "")
            )
            .replace(
            /^(EEEP|ESCOLA\s+ESTADUAL\s+DE\s+EDUCACAO\s+PROFISSIONAL)\s+/,
            ""
        );
    }

    return chave;
}

module.exports = {
    limpar,
    chaveEntidade,
};
