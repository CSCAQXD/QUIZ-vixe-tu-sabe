import municipalities from '../../../shared/municipios.json'

const SERTAO_CENTRAL_IDS = new Set([
  '2301851', // Banabuiú
  '2303931', // Choró
  '2304269', // Deputado Irapuan Pinheiro
  '2305266', // Ibaretama
  '2305332', // Ibicuitinga
  '2308351', // Milhã
  '2308500', // Mombaça
  '2310506', // Pedra Branca
  '2310902', // Piquet Carneiro
  '2311306', // Quixadá
  '2311405', // Quixeramobim
  '2312700', // Senador Pompeu
  '2313005', // Solonópole
])

export function normalizeMunicipalityText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function regionPriority(municipality) {
  if (SERTAO_CENTRAL_IDS.has(municipality.id)) return 0
  if (municipality.uf === 'CE') return 1
  return 2
}

function matchScore(municipality, query) {
  if (municipality.nomeBusca === query) return 0
  if (municipality.nomeBusca.startsWith(query)) return 1
  if (municipality.nomeBusca.split(' ').some((word) => word.startsWith(query))) {
    return 2
  }
  if (municipality.nomeBusca.includes(query)) return 3

  const queryTokens = query.split(' ')
  if (queryTokens.every((token) => municipality.buscaCompleta.includes(token))) {
    return 4
  }

  return null
}

const MUNICIPALITIES = municipalities.map((municipality) => ({
  ...municipality,
  buscaCompleta: `${normalizeMunicipalityText(municipality.nome)} ${municipality.uf}`,
  nomeBusca: normalizeMunicipalityText(municipality.nome),
}))

const MUNICIPALITIES_BY_ID = new Map(
  MUNICIPALITIES.map((municipality) => [municipality.id, municipality]),
)

export function findMunicipalityMatches(value, limit = 8) {
  const query = normalizeMunicipalityText(value)
  if (query.replace(/\s/g, '').length < 2) return []

  return MUNICIPALITIES.map((municipality) => ({
    municipality,
    score: matchScore(municipality, query),
  }))
    .filter(({ score }) => score !== null)
    .sort((first, second) => {
      return (
        regionPriority(first.municipality) - regionPriority(second.municipality) ||
        first.score - second.score ||
        first.municipality.nome.localeCompare(second.municipality.nome, 'pt-BR', {
          sensitivity: 'base',
        }) ||
        first.municipality.uf.localeCompare(second.municipality.uf)
      )
    })
    .slice(0, limit)
    .map(({ municipality }) => municipality)
}

export function getMunicipalityById(id) {
  return MUNICIPALITIES_BY_ID.get(String(id ?? '')) ?? null
}

export function findExactMunicipality(value, uf = '') {
  const query = normalizeMunicipalityText(value)
  const normalizedUf = String(uf ?? '')
    .trim()
    .toUpperCase()
  const matches = MUNICIPALITIES.filter(
    (municipality) =>
      municipality.nomeBusca === query && (!normalizedUf || municipality.uf === normalizedUf),
  )

  return matches.length === 1 ? matches[0] : null
}

export function isMunicipalitySelectionValid({ cidade, cidadeUf, municipioIbgeId }) {
  const municipality = getMunicipalityById(municipioIbgeId)

  return Boolean(
    municipality &&
      municipality.uf ===
        String(cidadeUf ?? '')
          .trim()
          .toUpperCase() &&
      municipality.nomeBusca === normalizeMunicipalityText(cidade),
  )
}

export function municipalityIdentityKey(city) {
  if (city?.municipioIbgeId) return `IBGE:${city.municipioIbgeId}`

  return [
    normalizeMunicipalityText(city?.cidade),
    String(city?.cidadeUf ?? '')
      .trim()
      .toUpperCase(),
  ].join(':')
}

export { SERTAO_CENTRAL_IDS }
