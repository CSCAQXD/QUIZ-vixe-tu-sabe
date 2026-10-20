import { useId, useRef, useState } from 'react'
import HintIcon from '../HintIcon/HintIcon'
import HintConfirmation from './HintConfirmation'
import './HintControl.css'

function HintControl({ availablePoints, nextHintPoints, onUseHint, remainingHints }) {
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const buttonRef = useRef(null)
  const statusId = useId()
  const hasHints = remainingHints > 0
  const status = hasHints
    ? `${remainingHints} ${remainingHints === 1 ? 'dica restante' : 'dicas restantes'}`
    : 'Sem dicas restantes'

  function cancelHint() {
    setConfirmationOpen(false)
    buttonRef.current?.focus()
  }

  function confirmHint() {
    if (!hasHints || !confirmationOpen) return
    setConfirmationOpen(false)
    onUseHint()
  }

  return (
    <div className="quiz-hint">
      <button
        aria-describedby={statusId}
        aria-haspopup="dialog"
        aria-label="Ver dicas"
        className="quiz-hint__button"
        disabled={!hasHints}
        title={status}
        onClick={() => setConfirmationOpen(true)}
        ref={buttonRef}
        type="button"
      >
        <HintIcon className="quiz-hint__icon" />
        <span aria-hidden="true">Dicas</span>
        <span aria-hidden="true" className="quiz-hint__count">
          {remainingHints}
        </span>
      </button>
      <span aria-live="polite" className="quiz-hint__remaining" id={statusId}>
        {status}
      </span>
      <HintConfirmation
        availablePoints={availablePoints}
        isOpen={confirmationOpen}
        nextHintPoints={nextHintPoints}
        onClose={cancelHint}
        onConfirm={confirmHint}
      />
    </div>
  )
}

export default HintControl
