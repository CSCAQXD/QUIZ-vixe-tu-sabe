import "./AnswerOption.css";

const LABELS = ["A", "B", "C", "D"];

function AnswerOption({
    disabled,
    index,
    onSelect,
    status = "default",
    text,
}) {
    return (
        <button
        className={`answer-option answer-option--${status}`}
        disabled={disabled}
        onClick={() => onSelect(index)}
        type="button"
        >
        <span className="answer-option__label">
            {LABELS[index]}
        </span>

        <span className="answer-option__text">
            {text}
        </span>
        </button>
    );
}

export default AnswerOption;