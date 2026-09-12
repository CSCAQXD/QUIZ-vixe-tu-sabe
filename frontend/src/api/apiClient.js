const API_URL = (
    import.meta.env.VITE_API_URL ??
    "http://localhost:3001"
).replace(/\/$/, "");

export async function apiRequest(
    path,
    options = {},
) {
    const response = await fetch(
        `${API_URL}${path}`,
        {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        },
    );

    const contentType =
        response.headers.get("content-type");

    const data = contentType?.includes(
        "application/json",
    )
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(
        data?.erro ??
            data?.mensagem ??
            "Não foi possível concluir a requisição.",
        );
    }

    return data;
}