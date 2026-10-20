import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import AnswerOption from '../../src/components/features/quiz/AnswerOption/AnswerOption'
import HintIcon from '../../src/components/features/quiz/HintIcon/HintIcon'
import RankingPodium from '../../src/components/features/rankings/RankingPodium/RankingPodium'
import RankingSummaryCard from '../../src/components/features/rankings/RankingSummaryCard/RankingSummaryCard'
import RankingTable from '../../src/components/features/rankings/RankingTable/RankingTable'

describe('componentes de funcionalidades', () => {
  it('seleciona uma resposta', async () => {
    const onSelect = vi.fn()
    render(<AnswerOption index={1} onSelect={onSelect} text="Resposta" />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(1)
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renderiza ícone, cartão e pódio', () => {
    const { container } = render(
      <>
        <HintIcon className="hint" />
        <RankingSummaryCard
          description="Escola A"
          participants={3}
          position={2}
          title="RANKING"
          tone="green"
        />
        <RankingPodium
          records={[
            { escolaId: 1, pontuacaoTotal: 300 },
            { escolaId: 2, pontuacaoTotal: 200 },
            { escolaId: 3, pontuacaoTotal: 100 },
          ]}
        />
      </>,
    )
    expect(container.querySelector('.hint')).toBeInTheDocument()
    expect(screen.getByText('Escola A')).toBeInTheDocument()
    expect(screen.getByLabelText('1º lugar, 300 pontos')).toBeInTheDocument()
  })

  it('não renderiza pódio sem registros', () => {
    const { container } = render(<RankingPodium records={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza tabela vazia e tabela com destaque', () => {
    const props = {
      columns: [{ key: 'nome', label: 'Nome' }],
      getRecordKey: (item) => item.id,
      highlightedKeys: new Set(['2']),
    }
    const { rerender } = render(<RankingTable {...props} records={[]} />)
    expect(screen.getByText(/Ainda não há/)).toBeInTheDocument()

    const scrollTo = vi.fn()
    Element.prototype.scrollTo = scrollTo
    rerender(
      <RankingTable
        {...props}
        records={[
          { id: '1', nome: 'A', posicao: 1 },
          { id: '2', nome: 'B' },
        ]}
      />,
    )
    fireEvent(window, new Event('animationframe'))
    expect(screen.getByRole('row', { name: '2 B' })).toHaveAttribute('aria-current', 'true')
  })
})
