import { apiRequest } from "./apiClient";

export async function registrarSessao(data) {
    return apiRequest("/sessao", {
        method: "POST",
        body: JSON.stringify(data),
    });
}