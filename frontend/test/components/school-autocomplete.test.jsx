import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'

import { buscarEscolasCatalogo } from '../../src/api/escolaApi'
import EscolaAutocomplete from '../../src/components/features/turmas/EscolaAutocomplete/EscolaAutocomplete'

vi.mock('../../src/api/escolaApi', () => ({
  buscarEscolasCatalogo: vi.fn(),
}))

function SchoolHarness({ municipioIbgeId = '2311306' }) {
  const [school, setSchool] = useState({ codigoInep: '', nomeEscola: '' })
  return (
    <>
      <EscolaAutocomplete
        {...school}
        id="escola-teste"
        municipioIbgeId={municipioIbgeId}
        onChange={setSchool}
      />
      <output>{school.codigoInep}</output>
    </>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  buscarEscolasCatalogo.mockResolvedValue([
    {
      codigoInep: '23000001',
      nome: 'EEEP MARIA MODELO',
      municipioIbgeId: '2311306',
      cidade: 'Quixadá',
      uf: 'CE',
      dependencia: 'Estadual',
    },
  ])
})

it('busca na cidade selecionada e guarda o código INEP', async () => {
  render(<SchoolHarness />)
  const input = screen.getByRole('combobox', { name: 'Nome da escola' })

  await userEvent.type(input, 'maria')
  const option = await screen.findByRole('option', { name: 'EEEP MARIA MODELO' })
  await userEvent.click(option)

  expect(input).toHaveValue('EEEP MARIA MODELO')
  expect(screen.getByText('23000001')).toBeInTheDocument()
  expect(buscarEscolasCatalogo).toHaveBeenCalledWith(
    expect.objectContaining({
      municipioIbgeId: '2311306',
      termo: 'maria',
    }),
  )
})

it('mantém a digitação manual quando não encontra a escola', async () => {
  buscarEscolasCatalogo.mockResolvedValue([])
  render(<SchoolHarness />)
  const input = screen.getByRole('combobox', { name: 'Nome da escola' })

  await userEvent.type(input, 'Escola Comunitária Nova')
  await waitFor(() => expect(screen.getByText(/Nenhuma escola encontrada/)).toBeInTheDocument())

  expect(input).toHaveValue('Escola Comunitária Nova')
})

it('associa ao sair do campo quando o nome digitado equivale a uma única escola', async () => {
  render(<SchoolHarness />)
  const input = screen.getByRole('combobox', { name: 'Nome da escola' })

  await userEvent.type(input, 'eeep maria modelo')
  await userEvent.tab()

  await waitFor(() => expect(input).toHaveValue('EEEP MARIA MODELO'))
  expect(screen.getByText('23000001')).toBeInTheDocument()
})

it('solicita a cidade antes de habilitar a busca', () => {
  render(<SchoolHarness municipioIbgeId="" />)

  expect(screen.getByRole('combobox', { name: 'Nome da escola' })).toBeDisabled()
  expect(screen.getByText('Selecione a cidade primeiro.')).toBeInTheDocument()
})
