import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'

import CadastroTurmasPage from '../../src/pages/CadastroTurmas/CadastroTurmasPage'
import { saveMediation } from '../../src/utils/storage'

vi.mock('../../src/utils/storage', () => ({ saveMediation: vi.fn() }))

it('salva uma mediação válida e abre o quiz', async () => {
  render(
    <MemoryRouter initialEntries={['/cadastro-turmas']}>
      <Routes>
        <Route path="/cadastro-turmas" element={<CadastroTurmasPage />} />
        <Route path="/quiz" element={<p>Quiz iniciado</p>} />
      </Routes>
    </MemoryRouter>,
  )

  await userEvent.type(screen.getByLabelText('Cidade'), 'Fortaleza')
  await userEvent.click(screen.getByRole('option', { name: 'Fortaleza — CE' }))
  await userEvent.type(screen.getByLabelText('Nome da escola'), 'Escola Modelo')
  await userEvent.click(screen.getByLabelText('Série'))
  await userEvent.click(screen.getByRole('option', { name: '3º ano — Ensino Fundamental' }))
  await userEvent.click(screen.getByLabelText('Organização da turma'))
  await userEvent.click(screen.getByRole('option', { name: 'Turma dividida' }))
  await userEvent.type(screen.getByLabelText('Identificação da turma'), 'A')
  await userEvent.click(
    screen.getByRole('button', {
      name: 'INICIAR QUIZ DA MEDIAÇÃO',
    }),
  )

  expect(saveMediation).toHaveBeenCalledWith(
    expect.objectContaining({
      nomeEscola: 'Escola Modelo',
      escolas: [
        {
          nomeEscola: 'Escola Modelo',
          cidade: 'Fortaleza',
          cidadeUf: 'CE',
          municipioIbgeId: '2304400',
          turmas: [
            {
              etapaEnsino: 'FUNDAMENTAL',
              tipoOrganizacao: 'REGULAR',
              organizacaoTurma: 'DIVIDIDA',
              serie: 3,
              turma: 'A',
            },
          ],
        },
      ],
    }),
  )
  expect(screen.getByText('Quiz iniciado')).toBeInTheDocument()
})
