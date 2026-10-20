import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import HintHistory from '../../src/components/features/quiz/HintHistory/HintHistory'

it('permite recolher e abrir dicas longas sem perder seu texto', async () => {
  const hint = 'Uma dica detalhada para os participantes. '.repeat(50)
  render(<HintHistory hints={[hint]} />)
  const summary = screen.getByText('Dicas usadas').closest('summary')
  const content = screen.getByRole('region', {
    name: 'Histórico de dicas desta pergunta',
    hidden: true,
  })
  expect(content).not.toBeVisible()
  summary.focus()
  expect(summary).toHaveFocus()
  await userEvent.click(summary)
  expect(content).toBeVisible()
  expect(within(content).getByRole('listitem').textContent).toBe(hint)
  await userEvent.click(summary)
  expect(content).not.toBeVisible()
  expect(content.textContent).toContain(hint)
})

it('não mostra a faixa antes de usar uma dica', () => {
  const { container } = render(<HintHistory hints={[]} />)
  expect(container).toBeEmptyDOMElement()
})
