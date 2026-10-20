import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import QuizConcluidoPage from '../../src/pages/QuizConcluido/QuizConcluidoPage'
import RankingsPage from '../../src/pages/Rankings/RankingsPage'
import * as api from '../../src/api/rankingApi'
import { saveResult } from '../../src/utils/storage'

vi.mock('../../src/api/escolaApi', () => ({
  listarEscolas: vi.fn().mockResolvedValue([{ id: 'escola-a', nome: 'Escola A' }]),
}))
vi.mock('../../src/api/rankingApi', () => ({
  listarRankingTurmas: vi.fn().mockResolvedValue({ ranking: [] }),
  listarRankingEscolas: vi.fn().mockResolvedValue({ ranking: [] }),
  listarRankingInterno: vi.fn().mockResolvedValue({ ranking: [] }),
  listarRankingCategoria: vi.fn().mockResolvedValue({ ranking: [] }),
}))

it('permite trocar todos os rankings depois de sair da tela de parabéns', async () => {
  saveResult({
    partida: { pontuacaoFinal: 100, categoriaQuiz: 'MEDIO' },
    escola: { id: 'escola-a', nome: 'Escola A' },
    turmas: [{ serie: 3, etapaEnsino: 'MEDIO', turma: 'A' }],
  })
  render(
    <MemoryRouter initialEntries={['/quiz-concluido']}>
      <Routes>
        <Route path="/quiz-concluido" element={<QuizConcluidoPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
      </Routes>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Ver todos os rankings' }))
  for (const label of [
    'Entre as Escolas',
    'Interno por escola',
    'Por categoria',
    'Geral de Turmas',
  ]) {
    fireEvent.click(screen.getByRole('button', { name: label, exact: true }))
    await screen.findByText('Ainda não há pontuações neste ranking.')
    expect(screen.getByRole('button', { name: label, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  }
  await waitFor(() =>
    expect(api.listarRankingInterno).toHaveBeenCalledWith('escola-a', expect.any(Object)),
  )
  expect(api.listarRankingEscolas).toHaveBeenCalled()
  expect(api.listarRankingCategoria).toHaveBeenCalledWith('MEDIO', expect.any(Object))
})
