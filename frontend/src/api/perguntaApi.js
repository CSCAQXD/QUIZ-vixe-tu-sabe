import { apiRequest } from "./apiClient";

export async function listarPerguntas(turmas = []) {
    const parametros = new URLSearchParams();

    turmas.forEach(({ etapaEnsino, serie }) => {
        parametros.append("turma", `${etapaEnsino}:${serie}`);
    });

    const consulta = parametros.size ? `?${parametros}` : "";
    const response =
        await apiRequest(`/perguntas${consulta}`);

    return response.perguntas ?? [];
}
