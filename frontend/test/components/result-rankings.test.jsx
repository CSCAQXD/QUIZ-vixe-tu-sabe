import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import ResultRankings from '../../src/components/features/rankings/ResultRankings/ResultRankings'

const groups = [
  {
    name: 'Escola A',
    position: 2,
    classes: [
      { name: 'Turma A1', position: 5, internalPosition: 1, internalTotal: 3 },
      { name: 'Turma A2', position: 8, internalPosition: 3, internalTotal: 3 },
    ],
  },
  {
    name: 'Escola B',
    position: 4,
    classes: [
      { name: 'Turma B1', position: 9, internalPosition: 2, internalTotal: 5 },
      { name: 'Turma B2', position: 10, internalPosition: 4, internalTotal: 5 },
    ],
  },
]

function expectPosition(title, position) {
  const card = screen.getByRole('heading', { name: title }).closest('article')
  expect(within(card).getByLabelText(`${position} posição no ranking`)).toBeInTheDocument()
}

it('mostra três rankings da seleção e reinicia a turma ao trocar a escola', () => {
  render(<ResultRankings groups={groups} schoolsTotal={6} classesTotal={20} />)
  expect(screen.getAllByRole('article')).toHaveLength(3)
  expectPosition('Geral de turmas', 5)
  expectPosition('Entre escolas', 2)
  expectPosition('Dentro da escola', 1)

  fireEvent.change(screen.getByRole('combobox', { name: 'Turma' }), {
    target: { value: '1' },
  })
  expectPosition('Geral de turmas', 8)
  expectPosition('Dentro da escola', 3)
  expectPosition('Entre escolas', 2)

  fireEvent.change(screen.getByRole('combobox', { name: 'Escola' }), {
    target: { value: '1' },
  })
  expect(screen.getByRole('combobox', { name: 'Turma' })).toHaveValue('0')
  expect(screen.getAllByRole('article')).toHaveLength(3)
  expectPosition('Geral de turmas', 9)
  expectPosition('Entre escolas', 4)
  expectPosition('Dentro da escola', 2)
  expect(screen.queryByText('Turma A2')).not.toBeInTheDocument()
})

it('dispensa seletores quando existe só uma escola e uma turma', () => {
  render(<ResultRankings groups={[{ ...groups[0], classes: [groups[0].classes[0]] }]} />)
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(3)
  expectPosition('Entre escolas', 2)
})
