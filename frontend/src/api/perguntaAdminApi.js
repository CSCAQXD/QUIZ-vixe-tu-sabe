import { API_URL, apiRequest } from './apiClient'
import { UserFacingError } from '../utils/errors'

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

export async function exportarRankings(token, ano) {
  let response
  try {
    response = await fetch(`${API_URL}/admin/rankings/exportar?ano=${encodeURIComponent(ano)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new UserFacingError('Não foi possível conectar ao servidor para gerar a planilha.')
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new UserFacingError(data?.erro ?? 'Não foi possível gerar a planilha de rankings.', {
      requestId: data?.requestId,
      status: response.status,
    })
  }

  return {
    arquivo: await response.blob(),
    nome: `vixe-tu-sabe-rankings-${ano}.xlsx`,
  }
}

export function reiniciarRankings(token, ano, senhaAdministrativa, confirmacao) {
  return apiRequest('/admin/rankings/reiniciar', {
    ...opcoes(token, 'POST'),
    body: JSON.stringify({ ano, senhaAdministrativa, confirmacao }),
  })
}
