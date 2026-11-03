import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import AppErrorBoundary from '../../src/components/common/AppErrorBoundary/AppErrorBoundary'

function BrokenScreen() {
  throw new TypeError("Cannot read properties of null (reading 'contextoQuiz')")
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('substitui falhas inesperadas por uma mensagem clara', () => {
  render(
    <AppErrorBoundary>
      <BrokenScreen />
    </AppErrorBoundary>,
  )

  expect(screen.getByRole('heading', { name: 'Eita! Algo inesperado aconteceu.' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Recarregar página' })).toBeVisible()
  expect(screen.queryByText(/Cannot read properties/)).not.toBeInTheDocument()
})
