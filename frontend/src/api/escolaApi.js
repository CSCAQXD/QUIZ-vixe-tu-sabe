import { apiRequest } from './apiClient'

export async function listarEscolas() {
  const response = await apiRequest('/escolas')

  return response.escolas ?? []
}

export async function buscarEscolasCatalogo({ municipioIbgeId, termo, limit = 8, signal }) {
  const query = new URLSearchParams({
    municipioIbgeId,
    q: termo,
    limit: String(limit),
  })
  const response = await apiRequest(`/escolas/catalogo?${query}`, { signal })

  return response.escolas ?? []
}
