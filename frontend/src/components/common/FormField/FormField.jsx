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
  required = false,
  type = 'text',
  value,
}) {
  const errorId = `${id}-error`

  return (
    <div className="form-field">
      <label className={`form-field__label${labelVisuallyHidden ? ' sr-only' : ''}`} htmlFor={id}>
        {label}
      </label>

      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="form-field__input"
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
        type={type}
        value={value}
      />

      <span aria-live="polite" className="form-field__error" id={errorId}>
        {error}
      </span>
    </div>
  )
}

export default FormField
