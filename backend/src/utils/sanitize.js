function limpar(texto) {
    if (typeof texto !== 'string') return texto;
    return texto.trim().toUpperCase();
}

module.exports = { limpar };
