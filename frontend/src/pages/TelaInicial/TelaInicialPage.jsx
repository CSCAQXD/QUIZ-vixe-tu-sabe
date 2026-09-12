import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button/Button";
import { clearQuizStorage } from "../../utils/storage";
import "./TelaInicialPage.css";

function TelaInicialPage() {
    const navigate = useNavigate();

    function startQuiz() {
        clearQuizStorage();
        navigate("/cadastro-turmas");
    }

    return (
        <section className="home-page">
        <div className="home-page__brand">
            <span>QUIZ CULTURAL</span>

            <h1>
            VIXE,
            <br />
            TU SABE?
            </h1>

            <p>
            Teste seus conhecimentos sobre
            Cego Aderaldo e a cultura cearense.
            </p>
        </div>

        <div className="home-page__actions">
            <Button onClick={startQuiz}>
            INICIAR
            </Button>

            <Button
            onClick={() =>
                navigate("/rankings")
            }
            variant="secondary"
            >
            RANKINGS
            </Button>
        </div>
        </section>
    );
}

export default TelaInicialPage;