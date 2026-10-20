import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, it, vi } from 'vitest'

import CidadeAutocomplete from '../../src/components/features/turmas/CidadeAutocomplete/CidadeAutocomplete'

function CityHarness({ onBlur = vi.fn() }) {
  const [city, setCity] = useState({
    cidade: '',
    cidadeUf: '',
    municipioIbgeId: '',
  })

  return (
    <>
      <CidadeAutocomplete {...city} id="cidade-teste" onBlur={onBlur} onChange={setCity} />
      <output data-testid="identity">
        {city.municipioIbgeId}:{city.cidadeUf}
      </output>
    </>
  )
}

it('busca sem lista gigante e seleciona a identidade oficial', async () => {
  render(<CityHarness />)
  const input = screen.getByRole('combobox', { name: 'Cidade' })

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  await userEvent.type(input, 'quixada')

  expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(8)
  await userEvent.click(screen.getByRole('option', { name: 'Quixadá — CE' }))

  expect(input).toHaveValue('Quixadá')
  expect(screen.getByText('— CE')).toBeInTheDocument()
  expect(screen.getByTestId('identity')).toHaveTextContent('2311306:CE')
})

it('permite selecionar pelo teclado', async () => {
  render(<CityHarness />)
  const input = screen.getByRole('combobox', { name: 'Cidade' })

  await userEvent.type(input, 'solonop')
  await userEvent.keyboard('{ArrowDown}{Enter}')

  expect(input).toHaveValue('Solonópole')
  expect(screen.getByTestId('identity')).toHaveTextContent('2313005:CE')
})
