import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import { listarPerguntas } from "../../api/perguntaApi";
import { registrarSessao } from "../../api/sessaoApi";
import Button from "../../components/common/Button/Button";
import PageStatus from "../../components/common/PageStatus/PageStatus";
import QuizBoard from "../../components/features/quiz/QuizBoard/QuizBoard";
import {
    calculateAvailablePoints,
    isCorrectAnswer,
    normalizeQuestion,
} from "../../utils/quiz";
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

    const [questions, setQuestions] =
        useState([]);

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

    const loadQuestions =
        useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const response =
            await listarPerguntas();

            const normalizedQuestions =
            response
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
        } catch (requestError) {
            setError(
            requestError.message,
            );
        } finally {
            setIsLoading(false);
        }
        }, []);

    useEffect(() => {
        if (!mediation) {
        navigate(
            "/cadastro-turmas",
            {
            replace: true,
            },
        );

        return;
        }

        loadQuestions();
    }, [
        loadQuestions,
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

    function openHint() {
        if (
        !currentQuestion ||
        currentQuestion.dicas.length === 0
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

        const correct =
        isCorrectAnswer(
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

        setIsSaving(true);
        setError("");

        try {
        const result =
            await registrarSessao({
            ...mediation,
            idempotencyKey:
                crypto.randomUUID(),
            pontuacaoFinal: score,
            });

        saveResult(result);

        navigate(
            "/quiz-concluido",
            {
            replace: true,
            },
        );
        } catch (requestError) {
        setError(
            requestError.message,
        );

        setIsSaving(false);
        }
    }

    function nextQuestion() {
        const nextIndex =
        questionIndex + 1;

        if (
        nextIndex >= questions.length
        ) {
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
                onClick={loadQuestions}
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
        return null;
    }

    return (
        <section className="quiz-page">
        <QuizBoard
            answerState={answerState}
            availablePoints={
            availablePoints
            }
            currentHint={currentHint}
            currentQuestion={
            currentQuestion
            }
            currentQuestionIndex={
            questionIndex
            }
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
            selectedAnswer={
            selectedAnswer
            }
            totalQuestions={
            questions.length
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