const FAIXAS = ["FUNDAMENTAL_1", "FUNDAMENTAL_2", "MEDIO"];

function obterFaixaEnsino(turma) {
    if (turma.etapaEnsino === "MEDIO") return "MEDIO";

    return Number(turma.serie) <= 5 ? "FUNDAMENTAL_1" : "FUNDAMENTAL_2";
}

function obterMenorFaixa(turmas = []) {
    if (turmas.length === 0) return null;

    return turmas.map(obterFaixaEnsino).sort((a, b) => FAIXAS.indexOf(a) - FAIXAS.indexOf(b))[0];
}

function normalizarFaixaPergunta(valor) {
    const normalizada = String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    if (!normalizada || ["GERAL", "TODAS", "COMUM"].includes(normalizada)) {
        return "TODAS";
    }

    const aliases = {
        FUNDAMENTAL_I: "FUNDAMENTAL_1",
        FUNDAMENTAL_II: "FUNDAMENTAL_2",
        FUNDAMENTAL1: "FUNDAMENTAL_1",
        FUNDAMENTAL2: "FUNDAMENTAL_2",
        ENSINO_MEDIO: "MEDIO",
        ENSINOMEDIO: "MEDIO",
    };

    return aliases[normalizada] ?? (FAIXAS.includes(normalizada) ? normalizada : null);
}

module.exports = {
    normalizarFaixaPergunta,
    obterFaixaEnsino,
    obterMenorFaixa,
};
