import {
    Navigate,
    useNavigate,
} from "react-router-dom";

import Button from "../../components/common/Button/Button";
import {
    clearQuizStorage,
    getResult,
} from "../../utils/storage";

import "./QuizConcluidoPage.css";

function QuizConcluidoPage() {
    const navigate = useNavigate();
    const result = getResult();

    if (!result) {
        return (
        <Navigate
            replace
            to="/"
        />
        );
    }

    const finalScore =
        result.partida?.pontuacaoFinal ?? 0;

    function returnHome() {
        clearQuizStorage();
        navigate("/");
    }

    return (
        <section className="completed-page">
        <span
            aria-hidden="true"
            className="completed-page__star"
        >
            ★
        </span>

        <h1>PARABÉNS</h1>

        <p>
            QUIZ CONCLUÍDO COM SUCESSO
        </p>

        <div className="completed-page__score">
            <span>PONTUAÇÃO FINAL</span>
            <strong>{finalScore}</strong>
            <span>PONTOS</span>
        </div>

        <section className="completed-page__ranking">
            <h2>
            SUA PONTUAÇÃO NOS RANKINGS
            </h2>

            <h3>
            {result.escola?.nome}
            </h3>

            <p>
            {result.escola?.cidade}
            </p>

            <ul>
            {result.turmas?.map(
                (turma) => (
                <li key={turma.id}>
                    <strong>
                    {turma.serie}º ano —{" "}
                    Turma {turma.turma}
                    </strong>

                    <span>
                    Posição interna:{" "}
                    {turma.posicaoRankingInterno ??
                        "—"}{" "}
                    de{" "}
                    {turma.totalTurmasNoRankingInterno}
                    </span>

                    <span>
                    Pontuação acumulada:{" "}
                    {turma.pontuacaoAcumulada}
                    </span>
                </li>
                ),
            )}
            </ul>
        </section>

        <div className="completed-page__actions">
            <Button
            onClick={() =>
                navigate("/rankings")
            }
            >
            VER TODOS OS RANKINGS
            </Button>

            <Button
            onClick={returnHome}
            variant="secondary"
            >
            VOLTAR AO INÍCIO
            </Button>
        </div>
        </section>
    );
}

export default QuizConcluidoPage;