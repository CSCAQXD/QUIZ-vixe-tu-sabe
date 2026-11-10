import { describe, expect, it, vi } from 'vitest'

import { createRandomId } from '../../../src/utils/randomId'

describe('random id', () => {
  it('usa randomUUID quando o navegador disponibiliza a função', () => {
    const randomUUID = vi.fn(() => 'uuid-nativo')

    expect(createRandomId({ randomUUID })).toBe('uuid-nativo')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('gera um UUID v4 quando randomUUID não está disponível em HTTP', () => {
    const getRandomValues = vi.fn((bytes) => bytes.fill(0))

    expect(createRandomId({ getRandomValues })).toBe('00000000-0000-4000-8000-000000000000')
    expect(getRandomValues).toHaveBeenCalledOnce()
  })
})
