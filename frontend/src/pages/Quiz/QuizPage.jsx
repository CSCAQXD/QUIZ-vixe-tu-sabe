import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { carregarQuiz } from "../../api/perguntaApi";
import { registrarSessao } from "../../api/sessaoApi";
import Button from "../../components/common/Button/Button";
import PageStatus from "../../components/common/PageStatus/PageStatus";
import ScenicBackdrop from "../../components/common/ScenicBackdrop/ScenicBackdrop";
import QuizBoard from "../../components/features/quiz/QuizBoard/QuizBoard";

import {
    calculateAvailablePoints,
    isCorrectAnswer,
    normalizeQuestion,
} from "../../utils/quiz";
import { getMediationSchools } from "../../utils/mediation";

import {
    getMediation,
    saveResult,
} from "../../utils/storage";

import "./QuizPage.css";

function QuizPage() {
    const navigate = useNavigate();

    const mediation = useMemo(
        () => getMediation(),
        [],
    );

    const [idempotencyKey] = useState(
        () => crypto.randomUUID(),
    );

    const [questions, setQuestions] =
        useState([]);

    const [quizContext, setQuizContext] = useState(null);

    const [questionIndex, setQuestionIndex] =
        useState(0);

    const [selectedAnswer, setSelectedAnswer] =
        useState(null);

    const [answerState, setAnswerState] =
        useState("answering");

    const [score, setScore] =
        useState(0);

    const [hintsUsed, setHintsUsed] =
        useState(0);

    const [isHintOpen, setIsHintOpen] =
        useState(false);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loadAttempt, setLoadAttempt] =
        useState(0);

    useEffect(() => {
        if (!mediation) {
        navigate("/cadastro-turmas", {
            replace: true,
        });

        return undefined;
        }

        let active = true;

        const turmas = getMediationSchools(mediation)
            .flatMap((school) => school.turmas ?? []);

        carregarQuiz(turmas)
        .then((response) => {
            if (!active) {
            return;
            }

            if (!response.contextoQuiz || !response.categoriaQuiz) {
                throw new Error(
                    "Não foi possível preparar esta mediação. Tente carregar as perguntas novamente.",
                );
            }

            const normalizedQuestions = (response.perguntas ?? [])
            .map(normalizeQuestion)
            .filter(
                (question) =>
                question.opcoes.length === 4 &&
                question.correctIndex !== -1,
            );

            if (
            normalizedQuestions.length === 0
            ) {
            throw new Error(
                "Nenhuma pergunta válida foi encontrada.",
            );
            }

            setQuestions(
            normalizedQuestions,
            );
            setQuizContext({
                contextoQuiz: response.contextoQuiz,
                categoriaQuiz: response.categoriaQuiz,
            });
        })
        .catch((requestError) => {
            if (active) {
            setError(
                requestError.message,
            );
            }
        })
        .finally(() => {
            if (active) {
            setIsLoading(false);
            }
        });

        return () => {
        active = false;
        };
    }, [
        loadAttempt,
        mediation,
        navigate,
    ]);

    const currentQuestion =
        questions[questionIndex];

    const availablePoints =
        currentQuestion
        ? calculateAvailablePoints(
            currentQuestion.pontosIniciais,
            hintsUsed,
            )
        : 0;

    const currentHint =
        currentQuestion?.dicas[
        Math.max(0, hintsUsed - 1)
        ] ?? "";

    const remainingHints = Math.max(0, (currentQuestion?.dicas.length ?? 0) - hintsUsed);
    const usedHints = currentQuestion?.dicas.slice(0, hintsUsed) ?? [];
    const nextHintPoints = currentQuestion
        ? calculateAvailablePoints(currentQuestion.pontosIniciais, hintsUsed + 1)
        : 0;

    function retryQuestions() {
        setError("");
        setIsLoading(true);
        setLoadAttempt(
        (current) => current + 1,
        );
    }

    function openHint() {
        if (
        !currentQuestion ||
        remainingHints === 0 ||
        answerState !== "answering" ||
        isHintOpen
        ) {
        return;
        }

        setHintsUsed((current) =>
        Math.min(
            current + 1,
            currentQuestion.dicas.length,
        ),
        );

        setIsHintOpen(true);
    }

    function confirmAnswer() {
        if (
        selectedAnswer === null ||
        !currentQuestion
        ) {
        return;
        }

        const correct = isCorrectAnswer(
        currentQuestion,
        selectedAnswer,
        );

        if (correct) {
        setScore(
            (current) =>
            current + availablePoints,
        );

        setAnswerState("correct");
        return;
        }

        setAnswerState("wrong");
    }

    async function finishQuiz() {
        if (!mediation || isSaving) {
        return;
        }

        if (!quizContext?.contextoQuiz || !quizContext?.categoriaQuiz) {
            setError("Não foi possível confirmar esta mediação. Recarregue as perguntas antes de continuar.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
        const schools =
            getMediationSchools(mediation);

        const results = await Promise.all(
            schools.map((school, index) =>
            registrarSessao({
                ...school,
                idempotencyKey: `${idempotencyKey}-${index}`,
                pontuacaoFinal: score,
                contextoQuiz: quizContext.contextoQuiz,
            }),
            ),
        );

        const result = results.length === 1
            ? results[0]
            : {
                partida: {
                    pontuacaoFinal: score,
                    categoriaQuiz: quizContext.categoriaQuiz,
                },
                resultados: results,
            };

        saveResult(result);

        navigate("/quiz-concluido", {
            replace: true,
        });
        } catch (requestError) {
        setError(requestError.message);
        setIsSaving(false);
        }
    }

    function nextQuestion() {
        const nextIndex =
        questionIndex + 1;

        if (nextIndex >= questions.length) {
        finishQuiz();
        return;
        }

        setQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setAnswerState("answering");
        setHintsUsed(0);
        setIsHintOpen(false);
    }

    if (isLoading) {
        return (
        <PageStatus
            fullScreen
            message="Carregando perguntas..."
        />
        );
    }

    if (
        error &&
        questions.length === 0
    ) {
        return (
        <PageStatus
            action={
            <Button
                onClick={retryQuestions}
                variant="primary"
            >
                Tentar novamente
            </Button>
            }
            message={error}
            type="error"
        />
        );
    }

    if (!currentQuestion) {
        return (
        <PageStatus
            message="Nenhuma pergunta disponível."
            type="error"
        />
        );
    }

    return (
        <section className={`quiz-page${hintsUsed > 0 ? " quiz-page--with-history" : ""}`}>
        <ScenicBackdrop
            fenceClassName="quiz-page__fence"
            groundClassName="quiz-page__ground"
        />

        <QuizBoard
            answerState={answerState}
            availablePoints={availablePoints}
            currentHint={currentHint}
            currentQuestion={currentQuestion}
            remainingHints={remainingHints}
            usedHints={usedHints}
            nextHintPoints={nextHintPoints}
            isHintOpen={isHintOpen}
            onCloseHint={() =>
            setIsHintOpen(false)
            }
            onConfirm={confirmAnswer}
            onNext={nextQuestion}
            onOpenHint={openHint}
            onSelectAnswer={
            setSelectedAnswer
            }
            score={score}
            schoolName={mediation.nomeEscola}
            selectedAnswer={
            selectedAnswer
            }
        />

        {isSaving && (
            <p
            aria-live="polite"
            className="quiz-page__message"
            >
            Salvando resultado...
            </p>
        )}

        {error &&
            questions.length > 0 && (
            <div
                aria-live="polite"
                className="quiz-page__save-error"
            >
                <p>{error}</p>

                <Button
                disabled={isSaving}
                onClick={finishQuiz}
                variant="primary"
                >
                Tentar salvar novamente
                </Button>
            </div>
            )}
        </section>
    );
}

export default QuizPage;
