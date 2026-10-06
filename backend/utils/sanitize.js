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
        chave = chave.replace(
            /^(EEEP|ESCOLA ESTADUAL DE EDUCACAO PROFISSIONAL)\s+/,
            ""
        );
    }

    return chave;
}

module.exports = {
    limpar,
    chaveEntidade,
};
