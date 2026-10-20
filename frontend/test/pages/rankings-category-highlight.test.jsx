import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import RankingsPage from '../../src/pages/Rankings/RankingsPage'
import { listarRankingCategoria } from '../../src/api/rankingApi'
import { saveResult } from '../../src/utils/storage'

vi.mock('../../src/api/escolaApi', () => ({ listarEscolas: vi.fn().mockResolvedValue([]) }))
vi.mock('../../src/api/rankingApi', () => ({
  listarRankingCategoria: vi.fn(),
  listarRankingTurmas: vi.fn().mockResolvedValue({ ranking: [] }),
  listarRankingEscolas: vi.fn(),
  listarRankingInterno: vi.fn(),
}))

function chooseCategory(name) {
  fireEvent.click(screen.getByLabelText('Selecione a categoria'))
  fireEvent.click(screen.getByRole('option', { name }))
}

it.each([true, false])(
  'destaque considera entrada após partida (%s) e categoria efetivamente jogada',
  async (highlightRecentResult) => {
    const turma = { etapaEnsino: 'MEDIO', serie: 3, turma: 'A' }
    saveResult({ partida: { categoriaQuiz: 'MEDIO' }, escola: { id: 'e1' }, turmas: [turma] })
    listarRankingCategoria.mockResolvedValue({
      ranking: [{ ...turma, escolaId: 'e1', escola: 'Modelo', pontuacaoTotal: 100 }],
    })
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/rankings', state: { highlightRecentResult } }]}>
        <RankingsPage />
      </MemoryRouter>,
    )
    await screen.findByText('Ainda não há pontuações neste ranking.')
    fireEvent.click(screen.getByRole('button', { name: 'Por categoria' }))
    await screen.findByRole('cell', { name: 'Modelo' })
    expect(screen.getByLabelText('Selecione a categoria')).toHaveValue(
      highlightRecentResult ? 'MEDIO' : 'FUNDAMENTAL_1',
    )
    expect(container.querySelectorAll('tbody [aria-current=true]')).toHaveLength(
      highlightRecentResult ? 1 : 0,
    )
    chooseCategory('Fundamental II')
    await screen.findByRole('cell', { name: 'Modelo' })
    expect(container.querySelectorAll('tbody [aria-current=true]')).toHaveLength(0)
  },
)
