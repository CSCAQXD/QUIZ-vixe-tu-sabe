import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RankingsPage from '../../src/pages/Rankings/RankingsPage'
import { listarEscolas } from '../../src/api/escolaApi'
import * as rankingApi from '../../src/api/rankingApi'
import { saveResult } from '../../src/utils/storage'

vi.mock('../../src/api/escolaApi', () => ({ listarEscolas: vi.fn() }))
vi.mock('../../src/api/rankingApi', () => ({
  listarRankingEscolas: vi.fn(),
  listarRankingInterno: vi.fn(),
  listarRankingTurmas: vi.fn(),
  listarRankingCategoria: vi.fn(),
}))

const response = { ranking: [] }

describe('RankingsPage', () => {
  afterEach(() => vi.restoreAllMocks())

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(0)
    listarEscolas.mockResolvedValue([{ id: 'e1', nome: 'Escola Modelo', cidade: 'Quixadá' }])
    Object.values(rankingApi).forEach((request) => request.mockResolvedValue(response))
  })

  it('alterna entre os tipos de ranking', async () => {
    render(
      <MemoryRouter>
        <RankingsPage />
      </MemoryRouter>,
    )
    await screen.findByText('Ainda não há pontuações neste ranking.')
    expect(screen.queryByText('Destaques do ranking')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Entre as Escolas'))
    await waitFor(() => expect(rankingApi.listarRankingEscolas).toHaveBeenCalled())

    fireEvent.click(screen.getByText('Interno por escola'))
    await waitFor(() =>
      expect(rankingApi.listarRankingInterno).toHaveBeenCalledWith('e1', expect.any(Object)),
    )
    expect(screen.getByText(/Escola Modelo/)).toBeInTheDocument()
  })

  it.each([
    ['acesso direto', undefined, 0],
    ['entrada pela tela inicial', { highlightRecentResult: false }, 0],
    ['após concluir a partida', { highlightRecentResult: true }, 1],
  ])('aplica o destaque apenas no contexto correto: %s', async (_, state, count) => {
    saveResult({
      escola: { id: 'e1' },
      turmas: [{ etapaEnsino: 'MEDIO', serie: 3, turma: 'A', cursoId: 'c1' }],
    })
    const ranking = ['A', 'B'].map((turma, index) => ({
      escolaId: `e${index + 1}`,
      escola: `Escola ${turma}`,
      etapaEnsino: 'MEDIO',
      serie: 3,
      turma,
      cursoId: 'c1',
      serieFormatada: '3º ano — Ensino Médio',
      pontuacaoTotal: 200,
    }))
    Object.values(rankingApi).forEach((request) => request.mockResolvedValue({ ranking }))
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/rankings', state }]}>
        <RankingsPage />
      </MemoryRouter>,
    )
    await screen.findByRole('cell', { name: 'Escola A' })
    expect(container.querySelectorAll('tbody [aria-current=true]')).toHaveLength(count)

    fireEvent.click(screen.getByRole('button', { name: 'Entre as Escolas' }))
    await screen.findByRole('cell', { name: 'Escola A' })
    expect(container.querySelectorAll('tbody [aria-current=true]')).toHaveLength(count)

    fireEvent.click(screen.getByRole('button', { name: 'Interno por escola' }))
    await screen.findByRole('cell', { name: 'A' })
    expect(container.querySelectorAll('tbody [aria-current=true]')).toHaveLength(count)
  })

  it('mantém os destaques recolhidos e permite expandi-los', async () => {
    rankingApi.listarRankingTurmas.mockResolvedValue({
      ranking: [{ escolaId: 'e1', escola: 'Escola Modelo', turma: 'A', pontuacaoTotal: 100 }],
    })
    render(
      <MemoryRouter>
        <RankingsPage />
      </MemoryRouter>,
    )
    const podium = await screen.findByLabelText('Pódio do ranking')
    expect(podium).not.toBeVisible()
    fireEvent.click(screen.getByText('Destaques do ranking'))
    expect(podium).toBeVisible()
  })
})
