export const RANKING_PAGE_SIZE = 15;

function normalize(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/(\d)\s*\.?\s*[ºª°]/g, "$1")
        .toLocaleLowerCase("pt-BR");
}

function searchWords(value) {
    return normalize(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

const SEARCH_FIELDS = [
    "escola", "cidade", "serie", "serieFormatada", "cursoNome", "turma",
];

export function filterRanking(records, search) {
    const terms = searchWords(search);

    if (terms.length === 0) return records;

    return records.filter((record) => {
        const words = SEARCH_FIELDS.flatMap((field) => searchWords(record[field]));
        return terms.every((term) => words.some((word) =>
            /^\d+$/.test(term) ? word === term : word.includes(term),
        ));
    });
}

export function paginateRanking(records, page) {
    const start = (page - 1) * RANKING_PAGE_SIZE;
    return records.slice(start, start + RANKING_PAGE_SIZE);
}
