import { useMemo, useRef, useState } from 'react'
import './SelectField.css'

const MAX_VISIBLE_OPTIONS = 6

function SelectField({
  error = '',
  id,
  label,
  labelVisuallyHidden = false,
  onBlur,
  onChange,
  options,
  placeholder,
  required = false,
  value,
}) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const [opensUpward, setOpensUpward] = useState(false)
  const triggerRef = useRef(null)
  const errorId = `${id}-error`
  const labelId = `${id}-label`
  const listId = `${id}-options`
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null
  const currentLabel = selectedOption?.label ?? placeholder
  const estimatedListHeight = useMemo(
    () => Math.min(options.length, MAX_VISIBLE_OPTIONS) * 46 + 12,
    [options.length],
  )

  function openList() {
    const rectangle = triggerRef.current?.getBoundingClientRect()
    if (rectangle) {
      const scrollContainer = triggerRef.current?.closest('.registration-page__forms')
      const containerRectangle = scrollContainer?.getBoundingClientRect()
      const lowerBoundary = Math.min(
        window.innerHeight,
        containerRectangle?.bottom ?? window.innerHeight,
      )
      const upperBoundary = Math.max(0, containerRectangle?.top ?? 0)
      const spaceBelow = lowerBoundary - rectangle.bottom
      const spaceAbove = rectangle.top - upperBoundary
      setOpensUpward(spaceBelow < estimatedListHeight + 12 && spaceAbove > spaceBelow)
    }
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }

  function selectOption(option) {
    onChange(option.value)
    setIsOpen(false)
    setActiveIndex(-1)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!isOpen) openList()
      else if (activeIndex >= 0) selectOption(options[activeIndex])
      return
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    if (!isOpen) {
      openList()
      return
    }

    setActiveIndex((current) => {
      if (event.key === 'Home') return 0
      if (event.key === 'End') return options.length - 1
      if (event.key === 'ArrowDown') {
        return current >= options.length - 1 ? 0 : current + 1
      }
      return current <= 0 ? options.length - 1 : current - 1
    })
  }

  function handleContainerBlur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsOpen(false)
    setActiveIndex(-1)
    onBlur?.()
  }

  return (
    <div className="select-field" onBlur={handleContainerBlur}>
      <label className={`select-field__label${labelVisuallyHidden ? ' sr-only' : ''}`} id={labelId}>
        {label}
      </label>

      <div className="select-field__control-wrap">
        <button
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          aria-controls={listId}
          aria-describedby={error ? errorId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          aria-labelledby={labelId}
          aria-required={required}
          className={`select-field__control${selectedOption ? '' : ' select-field__control--placeholder'}`}
          id={id}
          onClick={() => (isOpen ? setIsOpen(false) : openList())}
          onKeyDown={handleKeyDown}
          ref={triggerRef}
          role="combobox"
          type="button"
          value={value}
        >
          <span className="select-field__value">{currentLabel}</span>
          <span
            aria-hidden="true"
            className={`select-field__arrow${isOpen ? ' select-field__arrow--open' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className={`select-field__popover${opensUpward ? ' select-field__popover--up' : ''}`}
          >
            <ul
              aria-labelledby={labelId}
              className="select-field__options"
              id={listId}
              role="listbox"
            >
              {options.map((option, index) => (
                <li key={option.value} role="presentation">
                  <button
                    aria-selected={option.value === value}
                    className={`select-field__option${activeIndex === index ? ' select-field__option--active' : ''}`}
                    id={`${id}-option-${index}`}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                    tabIndex={-1}
                    type="button"
                  >
                    {option.label}
                    {option.value === value && (
                      <span aria-hidden="true" className="select-field__check">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <span aria-live="polite" className="select-field__error" id={errorId}>
        {error}
      </span>
    </div>
  )
}

export default SelectField
