import "./FormField.css";

function FormField({
    error = "",
    id,
    label,
    maxLength,
    min,
    onChange,
    placeholder = "",
    required = false,
    type = "text",
    value,
}) {
    const errorId = `${id}-error`;

    return (
        <div className="form-field">
        <label
            className="form-field__label"
            htmlFor={id}
        >
            {label}
        </label>

        <input
            aria-describedby={error ? errorId : undefined}
            aria-invalid={Boolean(error)}
            className="form-field__input"
            id={id}
            maxLength={maxLength}
            min={min}
            onChange={(event) =>
            onChange(event.target.value)
            }
            placeholder={placeholder}
            required={required}
            type={type}
            value={value}
        />

        {error && (
            <span
            className="form-field__error"
            id={errorId}
            >
            {error}
            </span>
        )}
        </div>
    );
}

export default FormField;