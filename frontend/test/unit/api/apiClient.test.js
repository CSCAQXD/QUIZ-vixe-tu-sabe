import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../../src/api/apiClient'

describe('apiRequest', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envia JSON, preserva headers e retorna a resposta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/teste', { headers: { Authorization: 'x' } })).resolves.toEqual({
      ok: true,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/teste',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json', Authorization: 'x' },
      }),
    )
  })

  it.each([
    [{ erro: 'erro específico' }, 'erro específico'],
    [{ mensagem: 'mensagem específica' }, 'mensagem específica'],
    [{}, 'Não foi possível concluir a requisição.'],
  ])('trata erros da API', async (body, message) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => body,
      }),
    )
    await expect(apiRequest('/erro')).rejects.toThrow(message)
  })

  it('aceita resposta sem conteúdo JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
      }),
    )
    await expect(apiRequest('/vazio')).resolves.toBeNull()
  })

  it('preserva o código, o status e o identificador de erros recuperáveis', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          codigo: 'QUIZ_CONTEXT_INVALID',
          erro: 'Contexto inválido.',
          requestId: 'request-123',
        }),
      }),
    )

    const error = await apiRequest('/sessao').catch((requestError) => requestError)
    expect(error).toMatchObject({
      code: 'QUIZ_CONTEXT_INVALID',
      message: 'Contexto inválido.',
      requestId: 'request-123',
      status: 400,
    })
  })

  it('traduz falhas de rede sem expor mensagens técnicas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(apiRequest('/ranking-categoria/MEDIO')).rejects.toThrow(
      'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.',
    )
  })
})
