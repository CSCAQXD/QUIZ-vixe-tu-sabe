import Button from '../../../common/Button/Button'
import Modal from '../../../common/Modal/Modal'

function HintConfirmation({ availablePoints, isOpen, nextHintPoints, onClose, onConfirm }) {
  const reducesPoints = nextHintPoints < availablePoints

  return (
    <Modal
      className="quiz-board__hint-modal quiz-hint-confirmation"
      isOpen={isOpen}
      onClose={onClose}
      title="Usar uma dica?"
    >
      <p className="quiz-hint-confirmation__copy">
        {reducesPoints ? (
          <>
            Ao usar esta dica, o valor desta pergunta passa de <strong>{availablePoints}</strong>{' '}
            para <strong>{nextHintPoints} pontos</strong>.
          </>
        ) : (
          <>
            Esta pergunta já vale <strong>{availablePoints} pontos</strong>. Você pode usar a dica
            sem nova redução.
          </>
        )}
      </p>
      <p className="quiz-hint-confirmation__note">A pontuação já conquistada não muda.</p>
      <div className="quiz-hint-confirmation__actions">
        <Button onClick={onClose} variant="secondary">
          Continuar sem dica
        </Button>
        <Button onClick={onConfirm} variant="primary">
          Usar dica
        </Button>
      </div>
    </Modal>
  )
}

export default HintConfirmation
