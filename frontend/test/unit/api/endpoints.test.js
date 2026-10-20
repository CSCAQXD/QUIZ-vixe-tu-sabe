import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../src/api/apiClient'
import { buscarEscolasCatalogo, listarEscolas } from '../../../src/api/escolaApi'
import { carregarQuiz, listarPerguntas } from '../../../src/api/perguntaApi'
import {
  listarRankingCategoria,
  listarRankingEscolas,
  listarRankingInterno,
  listarRankingTurmas,
} from '../../../src/api/rankingApi'
import { registrarSessao } from '../../../src/api/sessaoApi'

vi.mock('../../../src/api/apiClient', () => ({ apiRequest: vi.fn() }))

describe('endpoints do frontend', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lista escolas e perguntas com fallback vazio', async () => {
    apiRequest.mockResolvedValueOnce({ escolas: [{ id: 1 }] }).mockResolvedValueOnce({})
    await expect(listarEscolas()).resolves.toEqual([{ id: 1 }])
    await expect(listarPerguntas()).resolves.toEqual([])
  })

  it('monta URLs e parâmetros dos rankings', async () => {
    apiRequest.mockResolvedValue({ ranking: [] })
    await listarRankingTurmas({ ano: 2026, limit: '' })
    await listarRankingEscolas({ ano: 2026 })
    await listarRankingInterno('id/escola', { limit: 10 })
    await listarRankingCategoria('FUNDAMENTAL_1', { ano: 2026 })
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/ranking-turmas?ano=2026')
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/ranking-escolas?ano=2026')
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/ranking-interno/id%2Fescola?limit=10')
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/ranking-categoria/FUNDAMENTAL_1?ano=2026')
  })

  it('busca o catálogo de escolas por município', async () => {
    apiRequest.mockResolvedValue({ escolas: [{ codigoInep: '23000001' }] })

    await expect(
      buscarEscolasCatalogo({
        municipioIbgeId: '2311306',
        termo: 'Maria Modelo',
      }),
    ).resolves.toEqual([{ codigoInep: '23000001' }])
    expect(apiRequest).toHaveBeenCalledWith(
      '/escolas/catalogo?municipioIbgeId=2311306&q=Maria+Modelo&limit=8',
      { signal: undefined },
    )
  })

  it('envia todas as turmas ao consultar perguntas', async () => {
    apiRequest.mockResolvedValue({ perguntas: [] })

    await listarPerguntas([
      { etapaEnsino: 'MEDIO', serie: 2 },
      { etapaEnsino: 'FUNDAMENTAL', serie: 4 },
    ])

    expect(apiRequest).toHaveBeenCalledWith('/perguntas?turma=MEDIO%3A2&turma=FUNDAMENTAL%3A4')
  })

  it('registra uma sessão como JSON', async () => {
    apiRequest.mockResolvedValue({ ok: true })
    await registrarSessao({ pontos: 10 })
    expect(apiRequest).toHaveBeenCalledWith('/sessao', {
      method: 'POST',
      body: JSON.stringify({ pontos: 10 }),
    })
  })

  it('preserva categoria e contexto das perguntas sem limitar a quantidade', async () => {
    const response = {
      perguntas: Array.from({ length: 27 }, (_, id) => ({ id })),
      categoriaQuiz: 'FUNDAMENTAL_2',
      contextoQuiz: 'contexto-assinado',
    }
    apiRequest.mockResolvedValue(response)
    await expect(carregarQuiz()).resolves.toEqual(response)
    await expect(listarPerguntas()).resolves.toHaveLength(27)
  })
})
