const municipalities = require("../../shared/municipios.json");

function normalizarMunicipio(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

const catalog = municipalities.map((municipality) => ({
    ...municipality,
    nomeBusca: normalizarMunicipio(municipality.nome),
}));

const byId = new Map(catalog.map((municipality) => [municipality.id, municipality]));

function resolverMunicipio({ cidade, cidadeUf, municipioIbgeId }) {
    const cityName = normalizarMunicipio(cidade);
    const state = String(cidadeUf ?? "").trim().toUpperCase();
    const municipalityId = String(municipioIbgeId ?? "").trim();

    if (municipalityId) {
        const municipality = byId.get(municipalityId);
        if (!municipality) {
            return { erro: "O código IBGE da cidade não foi encontrado." };
        }

        if (municipality.nomeBusca !== cityName || (state && municipality.uf !== state)) {
            return { erro: "A cidade, a UF e o código IBGE informados não correspondem." };
        }

        return { municipio: municipality };
    }

    const matches = catalog.filter((municipality) =>
        municipality.nomeBusca === cityName &&
        (!state || municipality.uf === state)
    );

    if (matches.length === 1) return { municipio: matches[0] };

    if (matches.length > 1) {
        return { erro: "Selecione a cidade informando também a UF e o código IBGE." };
    }

    return { erro: "Selecione uma cidade válida do catálogo de municípios." };
}

module.exports = {
    normalizarMunicipio,
    resolverMunicipio,
};
