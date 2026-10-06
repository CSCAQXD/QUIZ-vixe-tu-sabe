export const RANKING_PAGE_SIZE = 15;

function normalize(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

export function filterRanking(records, search) {
    const term = normalize(search).trim();

    if (!term) return records;

    return records.filter((record) =>
        Object.values(record).some((value) => normalize(value).includes(term)),
    );
}

export function paginateRanking(records, page) {
    const start = (page - 1) * RANKING_PAGE_SIZE;
    return records.slice(start, start + RANKING_PAGE_SIZE);
}
