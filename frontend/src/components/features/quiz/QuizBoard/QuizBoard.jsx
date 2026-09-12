import AnswerOption from "../AnswerOption/AnswerOption";
import Button from "../../../common/Button/Button";
import Modal from "../../../common/Modal/Modal";
import "./QuizBoard.css";

function QuizBoard({
    answerState,
    availablePoints,
    currentHint,
    currentQuestion,
    currentQuestionIndex,
    isHintOpen,
    onCloseHint,
    onConfirm,
    onNext,
    onOpenHint,
    onSelectAnswer,
    score,
    selectedAnswer,
    totalQuestions,
}) {
    const answered =
        answerState === "correct" ||
        answerState === "wrong";

    function getOptionStatus(index) {
        if (!answered) {
        return selectedAnswer === index
            ? "selected"
            : "default";
        }

        if (index === currentQuestion.correctIndex) {
        return "correct";
        }

        if (
        answerState === "wrong" &&
        index === selectedAnswer
        ) {
        return "wrong";
        }

        return "muted";
    }

    function getFeedback() {
        if (answerState === "correct") {
        return {
            title: "RESPOSTA CORRETA",
            description: `+${availablePoints} pontos adicionados à sessão`,
        };
        }

        if (answerState === "wrong") {
        return {
            title: "RESPOSTA ERRADA",
            description:
            "A resposta correta está destacada abaixo",
        };
        }

        return null;
    }

    const feedback = getFeedback();

    return (
        <>
        <section className="quiz-board">
            <header className="quiz-board__header">
            <div>
                {feedback ? (
                <div
                    aria-live="polite"
                    className={`quiz-board__feedback quiz-board__feedback--${answerState}`}
                >
                    <strong>{feedback.title}</strong>
                    <span>{feedback.description}</span>
                </div>
                ) : (
                <span className="quiz-board__progress">
                    PERGUNTA{" "}
                    {currentQuestionIndex + 1} DE{" "}
                    {totalQuestions}
                </span>
                )}
            </div>

            <div className="quiz-board__score">
                <span>PONTUAÇÃO</span>
                <strong>{score}</strong>
            </div>
            </header>

            <div className="quiz-board__meta">
            <span>SOBRE O POETA</span>
            <strong>
                VALE {availablePoints} PONTOS
            </strong>
            </div>

            <article className="quiz-board__question">
            <h1>{currentQuestion.pergunta}</h1>
            </article>

            <div className="quiz-board__options">
            {currentQuestion.opcoes.map(
                (option, index) => (
                <AnswerOption
                    disabled={answered}
                    index={index}
                    key={`${currentQuestion.id}-${index}`}
                    onSelect={onSelectAnswer}
                    status={getOptionStatus(index)}
                    text={option}
                />
                ),
            )}
            </div>

            <div className="quiz-board__actions">
            {!answered && (
                <>
                <Button
                    disabled={
                    currentQuestion.dicas.length === 0
                    }
                    onClick={onOpenHint}
                    variant="secondary"
                >
                    Ver dica
                </Button>

                <Button
                    disabled={selectedAnswer === null}
                    onClick={onConfirm}
                    variant="dark"
                >
                    Confirmar resposta
                </Button>
                </>
            )}

            {answered && (
                <Button
                onClick={onNext}
                variant="primary"
                >
                Próxima pergunta
                </Button>
            )}
            </div>
        </section>

        <Modal
            isOpen={isHintOpen}
            onClose={onCloseHint}
            title="Dica"
        >
            <p>{currentHint}</p>

            <p className="quiz-board__hint-warning">
            O valor da pergunta agora é de{" "}
            {availablePoints} pontos.
            </p>
        </Modal>
        </>
    );
}

export default QuizBoard;