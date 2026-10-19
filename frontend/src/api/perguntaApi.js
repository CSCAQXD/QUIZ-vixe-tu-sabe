import { apiRequest } from "./apiClient";

export async function carregarQuiz(turmas = []) {
    const parametros = new URLSearchParams();

    turmas.forEach(({ etapaEnsino, serie }) => {
        parametros.append("turma", `${etapaEnsino}:${serie}`);
    });

    const consulta = parametros.size ? `?${parametros}` : "";
    const response =
        await apiRequest(`/perguntas${consulta}`);

    return response;
}

export async function listarPerguntas(turmas = []) {
    const response = await carregarQuiz(turmas);
    return response.perguntas ?? [];
}
