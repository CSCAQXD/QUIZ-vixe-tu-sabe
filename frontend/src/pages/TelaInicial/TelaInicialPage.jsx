import { useNavigate } from "react-router-dom";
import { clearQuizStorage } from "../../utils/storage";
import "./TelaInicialPage.css";

function TelaInicialPage() {
    const navigate = useNavigate();

    function startQuiz() {
        clearQuizStorage();
        navigate("/cadastro-turmas");
    }

    return (
        <section
        aria-label="Tela inicial do Vixe, Tu Sabe?"
        className="home-page"
        >
        <div className="home-page__stage">
            <img
            alt=""
            aria-hidden="true"
            className="home-page__art"
            draggable="false"
            src="/assets/figma/TELA%20INICIAL.svg"
            />

            <button
            aria-label="Iniciar quiz"
            className="home-page__hotspot home-page__hotspot--start"
            onClick={startQuiz}
            type="button"
            >
            <span className="sr-only">
                Iniciar quiz
            </span>
            </button>

            <button
            aria-label="Ver rankings"
            className="home-page__hotspot home-page__hotspot--rankings"
            onClick={() => navigate("/rankings")}
            type="button"
            >
            <span className="sr-only">
                Ver rankings
            </span>
            </button>
        </div>
        </section>
    );
}

export default TelaInicialPage;