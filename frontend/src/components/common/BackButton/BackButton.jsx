import { useNavigate } from 'react-router-dom'
import './BackButton.css'

function BackButton({ fallback = '/', label = 'Voltar' }) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallback)
  }

  return (
    <button aria-label={label} className="back-button" onClick={handleBack} type="button">
      <svg
        aria-hidden="true"
        className="back-button__icon"
        fill="none"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M26 16H7M14 9l-7 7 7 7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span className="back-button__label">{label}</span>
    </button>
  )
}

export default BackButton
