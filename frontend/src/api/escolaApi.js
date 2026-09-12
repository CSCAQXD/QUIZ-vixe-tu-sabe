import { apiRequest } from "./apiClient";

export async function listarEscolas() {
    const response =
        await apiRequest("/escolas");

    return response.escolas ?? [];
}