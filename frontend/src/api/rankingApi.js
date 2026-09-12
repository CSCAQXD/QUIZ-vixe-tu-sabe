import { apiRequest } from "./apiClient";

function buildQuery(params = {}) {
    const searchParams =
        new URLSearchParams();

    Object.entries(params).forEach(
        ([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            searchParams.set(key, value);
        }
        },
    );

    const query = searchParams.toString();

    return query ? `?${query}` : "";
}

export function listarRankingTurmas(
    params = {},
) {
    return apiRequest(
        `/ranking-turmas${buildQuery(params)}`,
    );
}

export function listarRankingEscolas(
    params = {},
) {
    return apiRequest(
        `/ranking-escolas${buildQuery(params)}`,
    );
}

export function listarRankingInterno(
    escolaId,
    params = {},
) {
    return apiRequest(
        `/ranking-interno/${encodeURIComponent(
        escolaId,
        )}${buildQuery(params)}`,
    );
}