import { useState } from 'react'

import './FormField.css'

function FormField({
  error = '',
  id,
  label,
  labelVisuallyHidden = false,
  max,
  maxLength,
  min,
  minLength,
  onBlur,
  onChange,
  placeholder = '',
  revealable = false,
  required = false,
  type = 'text',
  value,
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const errorId = `${id}-error`
  const canReveal = revealable && type === 'password'
  const inputType = canReveal && isRevealed ? 'text' : type

  return (
    <div className="form-field">
      <label className={`form-field__label${labelVisuallyHidden ? ' sr-only' : ''}`} htmlFor={id}>
        {label}
      </label>

      <div className="form-field__control">
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className={`form-field__input${canReveal ? ' form-field__input--revealable' : ''}`}
          id={id}
          aria-label={labelVisuallyHidden ? label : undefined}
          max={max}
          maxLength={maxLength}
          min={min}
          minLength={minLength}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={inputType}
          value={value}
        />

        {canReveal && (
          <button
            aria-label={isRevealed ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={isRevealed}
            className="form-field__reveal"
            onClick={() => setIsRevealed((current) => !current)}
            type="button"
          >
            {isRevealed ? (
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path
                  d="m4 4 16 16M10.7 10.7a2 2 0 0 0 2.6 2.6M9.9 5.2A9.7 9.7 0 0 1 12 5c5.4 0 9 7 9 7a17 17 0 0 1-2.1 3M6.6 6.7C4.3 8.3 3 12 3 12s3.6 7 9 7c1.2 0 2.3-.3 3.3-.7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path
                  d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        )}
      </div>

      <span aria-live="polite" className="form-field__error" id={errorId}>
        {error}
      </span>
    </div>
  )
}

export default FormField
