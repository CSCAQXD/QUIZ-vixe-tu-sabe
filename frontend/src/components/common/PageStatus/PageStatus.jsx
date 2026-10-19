import "./PageStatus.css";
import LoadingState from "../LoadingState/LoadingState";

function PageStatus({
    action,
    fullScreen = false,
    message,
    type = "loading",
}) {
    if (type === "loading") {
        return <LoadingState action={action} fullScreen={fullScreen} message={message} />;
    }

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
