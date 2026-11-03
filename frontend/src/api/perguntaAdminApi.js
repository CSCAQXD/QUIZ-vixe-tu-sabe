import { apiRequest } from './apiClient'

function opcoes(token, method = 'GET') {
  return {
    method,
    headers: { Authorization: `Bearer ${token}` },
  }
}

export function consultarStatusPerguntas(token) {
  return apiRequest('/perguntas/admin/status', opcoes(token))
}

export function validarPlanilhaPerguntas(token) {
  return apiRequest('/perguntas/admin/validar', opcoes(token, 'POST'))
}

export function ativarVersaoPerguntas(token, versaoId) {
  return apiRequest(
    `/perguntas/admin/versoes/${encodeURIComponent(versaoId)}/ativar`,
    opcoes(token, 'POST'),
  )
}
