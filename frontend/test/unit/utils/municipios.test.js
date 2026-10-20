import { describe, expect, it } from 'vitest'

import {
  findMunicipalityMatches,
  isMunicipalitySelectionValid,
  municipalityIdentityKey,
} from '../../../src/utils/municipios'

describe('catálogo de municípios', () => {
  it('prioriza Sertão Central, depois Ceará e depois Brasil', () => {
    const matches = findMunicipalityMatches('pedra', 20)

    expect(matches[0]).toMatchObject({ nome: 'Pedra Branca', uf: 'CE' })
    const firstOutsideCeara = matches.findIndex(({ uf }) => uf !== 'CE')
    expect(firstOutsideCeara).toBeGreaterThan(0)
  })

  it('encontra cidade sem depender de acentos ou caixa', () => {
    expect(findMunicipalityMatches('quixada', 2)[0]).toMatchObject({
      id: '2311306',
      nome: 'Quixadá',
      uf: 'CE',
    })
  })

  it('valida e identifica a cidade pelo código IBGE', () => {
    const city = {
      cidade: 'Quixadá',
      cidadeUf: 'CE',
      municipioIbgeId: '2311306',
    }

    expect(isMunicipalitySelectionValid(city)).toBe(true)
    expect(municipalityIdentityKey(city)).toBe('IBGE:2311306')
    expect(isMunicipalitySelectionValid({ ...city, cidade: 'Sobral' })).toBe(false)
  })
})
