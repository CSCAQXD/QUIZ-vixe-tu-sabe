import "./SelectField.css";

function SelectField({
  error = "",
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
  const errorId = `${id}-error`;

  return (
    <div className="select-field">
      <label
        className={`select-field__label${labelVisuallyHidden ? " sr-only" : ""}`}
        htmlFor={id}
      >
        {label}
      </label>

      <div className="select-field__control-wrap">
        <select
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          aria-label={labelVisuallyHidden ? label : undefined}
          className="select-field__control"
          id={id}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          value={value}
        >
          <option disabled value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span aria-hidden="true" className="select-field__arrow" />
      </div>

      <span
        aria-live="polite"
        className="select-field__error"
        id={errorId}
      >
        {error}
      </span>
    </div>
  );
}

export default SelectField;
