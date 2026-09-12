import { useNavigate } from "react-router-dom";
import "./BackButton.css";

function BackButton({
    fallback = "/",
    label = "Voltar",
}) {
    const navigate = useNavigate();

    function handleBack() {
        if (window.history.length > 1) {
        navigate(-1);
        return;
        }

        navigate(fallback);
    }

    return (
        <button
        aria-label={label}
        className="back-button"
        onClick={handleBack}
        type="button"
        >
        <span aria-hidden="true">←</span>
        <span>{label}</span>
        </button>
    );
}

export default BackButton;