import { useMemo, useState } from 'react'
import { findTechnicalCourseMatches, normalizeDisplayText } from '../../../../utils/mediation'
import '../../../common/FormField/FormField.css'
import './CursoAutocomplete.css'

const MAX_SUGGESTIONS = 8

function CursoAutocomplete({ error = '', id, onBlur, onChange, value }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const errorId = `${id}-error`
  const helpId = `${id}-help`
  const listId = `${id}-suggestions`
  const normalizedValue = normalizeDisplayText(value)
  const canSearch = normalizedValue.replace(/\s/g, '').length >= 2
  const suggestions = useMemo(
    () => (canSearch ? findTechnicalCourseMatches(normalizedValue, MAX_SUGGESTIONS) : []),
    [canSearch, normalizedValue],
  )
  const showSuggestions = isOpen && canSearch

  function selectCourse(courseName) {
    onChange(courseName)
    setActiveIndex(-1)
    setIsOpen(false)
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
        selectCourse(suggestions[activeIndex].name)
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

  return (
    <div className="form-field course-autocomplete">
      <label className="form-field__label" htmlFor={id}>
        Curso
      </label>

      <div className="course-autocomplete__control">
        <input
          aria-activedescendant={
            showSuggestions && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={listId}
          aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`}
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className="form-field__input"
          id={id}
          maxLength={120}
          minLength={2}
          onBlur={() => {
            setIsOpen(false)
            onBlur?.()
          }}
          onChange={(event) => {
            onChange(event.target.value)
            setActiveIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Digite para buscar. Ex.: Redes, Enfermagem ou ADS"
          required
          role="combobox"
          type="text"
          value={value}
        />

        {showSuggestions && (
          <div className="course-autocomplete__popover">
            <ul
              aria-label="Sugestões de cursos técnicos"
              className="course-autocomplete__list"
              id={listId}
              role="listbox"
            >
              {suggestions.length > 0 ? (
                suggestions.map((course, index) => (
                  <li key={course.name} role="presentation">
                    <button
                      aria-selected={activeIndex === index}
                      className="course-autocomplete__option"
                      id={`${id}-option-${index}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectCourse(course.name)}
                      role="option"
                      tabIndex={-1}
                      type="button"
                    >
                      <span>{course.name}</span>
                    </button>
                  </li>
                ))
              ) : (
                <li role="presentation">
                  <p className="course-autocomplete__empty" role="status">
                    Nenhum curso semelhante no catálogo. Você pode cadastrar esse novo nome.
                  </p>
                </li>
              )}
            </ul>

            {suggestions.length === MAX_SUGGESTIONS && (
              <p className="course-autocomplete__refine">
                Continue digitando para refinar os resultados.
              </p>
            )}
          </div>
        )}
      </div>

      <span className="course-autocomplete__help" id={helpId}>
        Digite para buscar ou cadastrar um curso.
      </span>

      <span aria-live="polite" className="form-field__error" id={errorId}>
        {error}
      </span>
    </div>
  )
}

export default CursoAutocomplete
