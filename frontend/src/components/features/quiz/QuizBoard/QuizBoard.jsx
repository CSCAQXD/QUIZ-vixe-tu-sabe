import AnswerOption from '../AnswerOption/AnswerOption'
import Button from '../../../common/Button/Button'
import Modal from '../../../common/Modal/Modal'
import HintControl from '../HintControl/HintControl'
import HintHistory from '../HintHistory/HintHistory'
import './QuizBoard.css'

const MAX_SCHOOL_NAME_LENGTH = 100
const DENSE_QUESTION_LENGTH = 180
const COMPACT_QUESTION_LENGTH = 320
const DENSE_OPTIONS_LENGTH = 170
const COMPACT_OPTIONS_LENGTH = 240
const DENSE_OPTION_LENGTH = 50
const COMPACT_OPTION_LENGTH = 70

function truncateSchoolName(name) {
  const characters = Array.from(String(name ?? ''))
  return characters.length > MAX_SCHOOL_NAME_LENGTH
    ? `${characters.slice(0, MAX_SCHOOL_NAME_LENGTH).join('')}...`
    : characters.join('')
}

function getContentDensity(question) {
  const questionLength = Array.from(String(question?.pergunta ?? '')).length
  const optionLengths = (question?.opcoes ?? []).map(
    (option) => Array.from(String(option ?? '')).length,
  )
  const longestOption = Math.max(0, ...optionLengths)
  const totalOptionsLength = optionLengths.reduce((total, length) => total + length, 0)

  if (
    questionLength >= COMPACT_QUESTION_LENGTH ||
    totalOptionsLength >= COMPACT_OPTIONS_LENGTH ||
    longestOption >= COMPACT_OPTION_LENGTH
  ) {
    return 'compact'
  }

  if (
    questionLength >= DENSE_QUESTION_LENGTH ||
    totalOptionsLength >= DENSE_OPTIONS_LENGTH ||
    longestOption >= DENSE_OPTION_LENGTH
  ) {
    return 'dense'
  }

  return 'standard'
}

function getQuestionParagraphs(question) {
  const text = String(question ?? '').trim()
  const explicitParagraphs = text
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (explicitParagraphs.length > 1 || Array.from(text).length < DENSE_QUESTION_LENGTH) {
    return explicitParagraphs
  }

  const directQuestionStart = text.lastIndexOf('. ')
  const directQuestion = text.slice(directQuestionStart + 2)

  if (directQuestionStart > 0 && directQuestion.length >= 30 && directQuestion.endsWith('?')) {
    return [text.slice(0, directQuestionStart + 1), directQuestion]
  }

  return explicitParagraphs
}

function isQuestionReference(paragraph) {
  return (
    /\((?:adaptad[oa]|tradução nossa)\)/i.test(paragraph) ||
    /^(?:fonte:|disponível em:)/i.test(paragraph)
  )
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
  const contentDensity = getContentDensity(currentQuestion)
  const questionParagraphs = getQuestionParagraphs(currentQuestion.pergunta)

  return (
    <>
      <section
        className={`quiz-board quiz-board--${contentDensity}${usedHints.length > 0 ? ' quiz-board--with-history' : ''}`}
      >
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
          <h1>
            {questionParagraphs.map((paragraph, index) => (
              <span
                className={`quiz-board__question-paragraph${isQuestionReference(paragraph) ? ' quiz-board__question-paragraph--reference' : ''}`}
                key={`${currentQuestion.id}-${index}`}
              >
                {paragraph}
              </span>
            ))}
          </h1>
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
