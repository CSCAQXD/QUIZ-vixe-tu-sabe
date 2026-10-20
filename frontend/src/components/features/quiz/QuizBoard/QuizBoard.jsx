import AnswerOption from '../AnswerOption/AnswerOption'
import Button from '../../../common/Button/Button'
import Modal from '../../../common/Modal/Modal'
import HintControl from '../HintControl/HintControl'
import HintHistory from '../HintHistory/HintHistory'
import './QuizBoard.css'

const MAX_SCHOOL_NAME_LENGTH = 100

function truncateSchoolName(name) {
  const characters = Array.from(String(name ?? ''))
  return characters.length > MAX_SCHOOL_NAME_LENGTH
    ? `${characters.slice(0, MAX_SCHOOL_NAME_LENGTH).join('')}...`
    : characters.join('')
}

function QuizBoard({
  answerState,
  availablePoints,
  currentHint,
  currentQuestion,
  remainingHints = currentQuestion.dicas.length,
  usedHints = [],
  nextHintPoints = availablePoints,
  isHintOpen,
  onCloseHint,
  onConfirm,
  onNext,
  onOpenHint,
  onSelectAnswer,
  score,
  schoolName,
  selectedAnswer,
}) {
  const answered = answerState === 'correct' || answerState === 'wrong'

  function getOptionStatus(index) {
    if (!answered) {
      return selectedAnswer === index ? 'selected' : 'default'
    }

    if (index === currentQuestion.correctIndex) {
      return 'correct'
    }

    if (answerState === 'wrong' && index === selectedAnswer) {
      return 'wrong'
    }

    return 'default'
  }

  function getFeedback() {
    if (answerState === 'correct') {
      return {
        title: 'RESPOSTA CORRETA',
        description: `+${availablePoints} pontos adicionados à sessão`,
      }
    }

    if (answerState === 'wrong') {
      return {
        title: 'RESPOSTA ERRADA',
        description: 'A resposta correta está destacada abaixo',
      }
    }

    return null
  }

  const feedback = getFeedback()
  const displayedSchoolName = truncateSchoolName(schoolName)

  return (
    <>
      <section className={`quiz-board${usedHints.length > 0 ? ' quiz-board--with-history' : ''}`}>
        {answered ? (
          <header
            aria-live="polite"
            className={`quiz-board__feedback quiz-board__feedback--${answerState}`}
          >
            <div>
              <strong>{feedback.title}</strong>
              <span>{feedback.description}</span>
            </div>

            <span className="quiz-board__score quiz-board__score--feedback">
              PONTUAÇÃO: {score}
            </span>
          </header>
        ) : (
          <header className="quiz-board__header">
            <HintControl
              availablePoints={availablePoints}
              nextHintPoints={nextHintPoints}
              onUseHint={onOpenHint}
              remainingHints={remainingHints}
            />

            <span
              aria-label={`Escola ${schoolName}`}
              className="quiz-board__school"
              title={displayedSchoolName === schoolName ? undefined : schoolName}
            >
              ESCOLA {displayedSchoolName}
            </span>

            <div className="quiz-board__score">
              <span>PONTUAÇÃO: {score}</span>
            </div>
          </header>
        )}

        <div className="quiz-board__meta">
          <span>{currentQuestion.tema}</span>
          <strong>
            <small>VALE</small>
            {availablePoints}
            <small>PONTOS</small>
          </strong>
        </div>

        <article className="quiz-board__question">
          <h1>{currentQuestion.pergunta}</h1>
        </article>

        <div className="quiz-board__options">
          {currentQuestion.opcoes.map((option, index) => (
            <AnswerOption
              disabled={answered}
              index={index}
              key={`${currentQuestion.id}-${index}`}
              onSelect={onSelectAnswer}
              status={getOptionStatus(index)}
              text={option}
            />
          ))}
        </div>

        <div className="quiz-board__actions">
          {!answered && (
            <>
              <Button disabled={selectedAnswer === null} onClick={onConfirm} variant="dark">
                Confirmar resposta
              </Button>
            </>
          )}

          {answered && (
            <Button onClick={onNext} variant="primary">
              Próxima pergunta
            </Button>
          )}
        </div>
        <HintHistory hints={usedHints} key={currentQuestion.id} />
      </section>

      <Modal
        className="quiz-board__hint-modal"
        isOpen={isHintOpen}
        onClose={onCloseHint}
        title="Uma pista para você"
      >
        <p className="quiz-board__hint-text">{currentHint}</p>

        <p className="quiz-board__hint-warning">
          O valor da pergunta agora é de {availablePoints} pontos.
        </p>
      </Modal>
    </>
  )
}

export default QuizBoard
