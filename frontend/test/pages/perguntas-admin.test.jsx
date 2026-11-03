import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PerguntasAdminPage from '../../src/pages/PerguntasAdmin/PerguntasAdminPage'
import {
  ativarVersaoPerguntas,
  consultarStatusPerguntas,
  validarPlanilhaPerguntas,
} from '../../src/api/perguntaAdminApi'

vi.mock('../../src/api/perguntaAdminApi', () => ({
  ativarVersaoPerguntas: vi.fn(),
  consultarStatusPerguntas: vi.fn(),
  validarPlanilhaPerguntas: vi.fn(),
}))

const status = {
  ativa: {
    id: 'versao-ativa',
    total: 50,
    status: 'ATIVA',
    criadaEm: '2026-11-03T10:00:00.000Z',
    ativadaEm: '2026-11-03T10:01:00.000Z',
  },
  versoes: [
    {
      id: 'versao-ativa',
      total: 50,
      status: 'ATIVA',
      criadaEm: '2026-11-03T10:00:00.000Z',
      ativadaEm: '2026-11-03T10:01:00.000Z',
    },
  ],
}

describe('administração das perguntas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consultarStatusPerguntas.mockResolvedValue(status)
  })

  it('exige o token e apresenta a versão ativa', async () => {
    const user = userEvent.setup()
    render(<PerguntasAdminPage />)

    fireEvent.change(screen.getByLabelText('Token administrativo'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Acessar' }))

    expect(await screen.findByRole('heading', { name: 'Banco de perguntas' })).toBeVisible()
    expect(screen.getByText('50 perguntas')).toBeVisible()
    expect(consultarStatusPerguntas).toHaveBeenCalledWith('token-administrativo-com-32-caracteres')
  })

  it('mostra as diferenças e só publica após confirmação', async () => {
    const user = userEvent.setup()
    validarPlanilhaPerguntas.mockResolvedValue({
      resultado: 'VERSAO_PRONTA',
      versao: { id: 'candidata', total: 51, status: 'RASCUNHO' },
      diferencas: { totais: { adicionadas: 2, alteradas: 1, removidas: 1 } },
    })
    ativarVersaoPerguntas.mockResolvedValue({
      mensagem: 'Versão de perguntas ativada com sucesso.',
    })
    render(<PerguntasAdminPage />)

    fireEvent.change(screen.getByLabelText('Token administrativo'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Acessar' }))
    await user.click(await screen.findByRole('button', { name: 'Verificar planilha' }))

    expect(await screen.findByRole('heading', { name: 'Alterações encontradas' })).toBeVisible()
    expect(ativarVersaoPerguntas).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Publicar esta versão' }))
    expect(ativarVersaoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'candidata',
    )
  })
})
