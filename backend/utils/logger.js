function escrever(nivel, evento, detalhes = {}) {
    const registro = {
        timestamp: new Date().toISOString(),
        nivel,
        evento,
        ...detalhes,
    };

    const mensagem = JSON.stringify(registro);

    if (nivel === "error") {
        console.error(mensagem);
        return;
    }

    console.log(mensagem);
}

module.exports = {
    info(evento, detalhes) {
        escrever("info", evento, detalhes);
    },
    error(evento, detalhes) {
        escrever("error", evento, detalhes);
    },
};
