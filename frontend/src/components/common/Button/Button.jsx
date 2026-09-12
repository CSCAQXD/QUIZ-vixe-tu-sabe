import "./Button.css";

function Button({
    children,
    className = "",
    disabled = false,
    onClick,
    type = "button",
    variant = "primary",
}) {
    const classes = [
        "button",
        `button--${variant}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
        className={classes}
        disabled={disabled}
        onClick={onClick}
        type={type}
        >
        {children}
        </button>
    );
}

export default Button;