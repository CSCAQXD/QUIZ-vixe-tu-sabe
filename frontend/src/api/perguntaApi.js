import { apiRequest } from "./apiClient";

export async function listarPerguntas() {
    const response =
        await apiRequest("/perguntas");

    return response.perguntas ?? [];
}