const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.')
  }

  const contentType = response.headers.get('content-type')

  const data = contentType?.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.erro ?? data?.mensagem ?? 'Não foi possível concluir a requisição.')
  }

  return data
}
