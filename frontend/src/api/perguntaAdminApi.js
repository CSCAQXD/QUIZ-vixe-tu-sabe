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

export function validarArquivoPerguntas(token, conteudoCsv) {
  return apiRequest('/perguntas/admin/validar-arquivo', {
    ...opcoes(token, 'POST'),
    headers: {
      ...opcoes(token).headers,
      'Content-Type': 'text/csv; charset=utf-8',
    },
    body: conteudoCsv,
  })
}

export function ativarVersaoPerguntas(token, versaoId) {
  return apiRequest(
    `/perguntas/admin/versoes/${encodeURIComponent(versaoId)}/ativar`,
    opcoes(token, 'POST'),
  )
}
