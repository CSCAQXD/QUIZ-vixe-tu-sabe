import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PerguntasAdminPage from '../../src/pages/PerguntasAdmin/PerguntasAdminPage'
import {
  ativarVersaoPerguntas,
  consultarStatusPerguntas,
  validarArquivoPerguntas,
} from '../../src/api/perguntaAdminApi'

vi.mock('../../src/api/perguntaAdminApi', () => ({
  ativarVersaoPerguntas: vi.fn(),
  consultarStatusPerguntas: vi.fn(),
  validarArquivoPerguntas: vi.fn(),
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

function renderPage() {
  return render(
    <MemoryRouter>
      <PerguntasAdminPage />
    </MemoryRouter>,
  )
}

describe('administração das perguntas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consultarStatusPerguntas.mockResolvedValue(status)
  })

  it('exige a senha e apresenta a versão ativa', async () => {
    const user = userEvent.setup()
    renderPage()

    const passwordField = screen.getByLabelText('Senha administrativa')
    expect(passwordField).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(passwordField).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeVisible()

    fireEvent.change(passwordField, {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Banco de perguntas' })).toBeVisible()
    expect(screen.getByText('50 perguntas')).toBeVisible()
    expect(consultarStatusPerguntas).toHaveBeenCalledWith('token-administrativo-com-32-caracteres')
  })

  it('mostra as diferenças e só publica após confirmação', async () => {
    const user = userEvent.setup()
    validarArquivoPerguntas.mockResolvedValue({
      resultado: 'VERSAO_PRONTA',
      versao: { id: 'candidata', total: 51, status: 'RASCUNHO' },
      diferencas: { totais: { adicionadas: 2, alteradas: 1, removidas: 1 } },
    })
    ativarVersaoPerguntas.mockResolvedValue({
      mensagem: 'Versão de perguntas ativada com sucesso.',
    })
    renderPage()

    fireEvent.change(screen.getByLabelText('Senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    const arquivo = new File(['id,faixa,tema'], 'perguntas.csv', { type: 'text/csv' })
    await user.upload(await screen.findByLabelText(/Escolher arquivo CSV/), arquivo)
    await user.click(screen.getByRole('button', { name: 'Verificar arquivo' }))

    expect(await screen.findByRole('heading', { name: 'Alterações encontradas' })).toBeVisible()
    expect(validarArquivoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'id,faixa,tema',
    )
    expect(ativarVersaoPerguntas).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Publicar atualização' }))
    expect(ativarVersaoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'candidata',
    )
  })
})
