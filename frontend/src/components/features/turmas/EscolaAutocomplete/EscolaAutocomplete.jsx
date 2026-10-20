import { useEffect, useMemo, useState } from 'react'
import { buscarEscolasCatalogo } from '../../../../api/escolaApi'
import { normalizeIdentityText, schoolIdentityKey } from '../../../../utils/mediation'
import '../../../common/FormField/FormField.css'
import './EscolaAutocomplete.css'

const MAX_SUGGESTIONS = 8

function EscolaAutocomplete({
  codigoInep,
  error = '',
  id,
  municipioIbgeId,
  nomeEscola,
  onBlur,
  onChange,
}) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const errorId = `${id}-error`
  const statusId = `${id}-status`
  const listId = `${id}-suggestions`
  const normalizedQuery = normalizeIdentityText(nomeEscola).replace(/\s/g, '')
  const canSearch = Boolean(municipioIbgeId) && normalizedQuery.length >= 2 && !codigoInep
  const showSuggestions = isOpen && canSearch

  useEffect(() => {
    if (!canSearch) {
      return undefined
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setSearchError('')
      try {
        const matches = await buscarEscolasCatalogo({
          municipioIbgeId,
          termo: nomeEscola,
          limit: MAX_SUGGESTIONS,
          signal: controller.signal,
        })
        setSuggestions(matches)
      } catch (requestError) {
        if (controller.signal.aborted) return
        setSuggestions([])
        setSearchError(requestError.message)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [canSearch, municipioIbgeId, nomeEscola])

  const duplicateNames = useMemo(() => {
    const counts = new Map()
    suggestions.forEach((school) => {
      const key = normalizeIdentityText(school.nome)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return counts
  }, [suggestions])

  function selectSchool(school) {
    onChange({
      codigoInep: school.codigoInep,
      nomeEscola: school.nome,
    })
    setActiveIndex(-1)
    setIsOpen(false)
  }

  async function associateTypedSchool() {
    if (!canSearch) return

    let candidates = suggestions
    const typedIdentity = schoolIdentityKey(nomeEscola)
    let exactMatches = candidates.filter(
      (school) => schoolIdentityKey(school.nome) === typedIdentity,
    )

    if (exactMatches.length === 0) {
      try {
        candidates = await buscarEscolasCatalogo({
          municipioIbgeId,
          termo: nomeEscola,
          limit: 20,
        })
        exactMatches = candidates.filter(
          (school) => schoolIdentityKey(school.nome) === typedIdentity,
        )
      } catch {
        return
      }
    }

    const uniqueMatches = new Map(exactMatches.map((school) => [school.codigoInep, school]))
    if (uniqueMatches.size === 1) {
      selectSchool(uniqueMatches.values().next().value)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setActiveIndex(-1)
      setIsOpen(false)
      return
    }

    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return

    if (event.key === 'Enter') {
      if (showSuggestions && activeIndex >= 0) {
        event.preventDefault()
        selectSchool(suggestions[activeIndex])
      }
      return
    }

    if (suggestions.length === 0) return

    event.preventDefault()
    setIsOpen(true)
    setActiveIndex((current) => {
      if (event.key === 'ArrowDown') {
        return current >= suggestions.length - 1 ? 0 : current + 1
      }
      return current <= 0 ? suggestions.length - 1 : current - 1
    })
  }

  const status = codigoInep
    ? ''
    : !municipioIbgeId
      ? 'Selecione a cidade primeiro.'
      : isLoading
        ? 'Buscando escolas...'
        : searchError
          ? 'Não foi possível consultar o catálogo. Você pode digitar o nome completo.'
          : ''

  return (
    <div className="form-field school-autocomplete">
      <label className="form-field__label" htmlFor={id}>
        Nome da escola
      </label>

      <div className="school-autocomplete__control">
        <input
          aria-activedescendant={
            showSuggestions && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={listId}
          aria-describedby={`${statusId}${error ? ` ${errorId}` : ''}`}
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className={`form-field__input${codigoInep ? ' school-autocomplete__input--selected' : ''}`}
          disabled={!municipioIbgeId}
          id={id}
          maxLength={200}
          minLength={3}
          onBlur={() => {
            setIsOpen(false)
            onBlur?.()
            void associateTypedSchool()
          }}
          onChange={(event) => {
            onChange({ codigoInep: '', nomeEscola: event.target.value })
            setActiveIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={municipioIbgeId ? 'Digite o nome da escola' : 'Selecione a cidade primeiro'}
          required
          role="combobox"
          type="text"
          value={nomeEscola}
        />

        {codigoInep && (
          <span aria-hidden="true" className="school-autocomplete__selected-mark">
            ✓
          </span>
        )}

        {showSuggestions && (
          <div className="school-autocomplete__popover">
            <ul
              aria-label="Sugestões de escolas"
              className="school-autocomplete__list"
              id={listId}
              role="listbox"
            >
              {suggestions.length > 0
                ? suggestions.map((school, index) => {
                    const repeated = duplicateNames.get(normalizeIdentityText(school.nome)) > 1
                    return (
                      <li key={school.codigoInep} role="presentation">
                        <button
                          aria-selected={activeIndex === index}
                          className="school-autocomplete__option"
                          id={`${id}-option-${index}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectSchool(school)}
                          role="option"
                          tabIndex={-1}
                          type="button"
                        >
                          {school.nome}
                          {repeated && school.dependencia && <span> — {school.dependencia}</span>}
                        </button>
                      </li>
                    )
                  })
                : !isLoading && (
                    <li role="presentation">
                      <p className="school-autocomplete__empty" role="status">
                        Nenhuma escola encontrada. Você pode digitar o nome completo.
                      </p>
                    </li>
                  )}
            </ul>
          </div>
        )}
      </div>

      <span aria-live="polite" className="school-autocomplete__status" id={statusId}>
        {status}
      </span>

      <span aria-live="polite" className="form-field__error" id={errorId}>
        {error}
      </span>
    </div>
  )
}

export default EscolaAutocomplete
