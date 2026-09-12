import "./PageStatus.css";

function PageStatus({
    action,
    message,
    type = "loading",
}) {
    return (
        <section
        aria-live="polite"
        className={`page-status page-status--${type}`}
        >
        <p>{message}</p>
        {action}
        </section>
    );
}

export default PageStatus;