import ScenicBackdrop from '../ScenicBackdrop/ScenicBackdrop'
import './LoadingState.css'

function LoadingState({ action, fullScreen = false, message = 'Carregando...' }) {
  return (
    <div className={`loading-state${fullScreen ? ' loading-state--full-screen' : ''}`}>
      {fullScreen && (
        <ScenicBackdrop
          fenceClassName="loading-state__fence"
          groundClassName="loading-state__ground"
        />
      )}
      <div
        aria-atomic="true"
        aria-busy="true"
        aria-live="polite"
        className="loading-state__card"
        role="status"
      >
        {fullScreen && (
          <img
            alt=""
            aria-hidden="true"
            className="loading-state__brand"
            src="/assets/brand/vixe-tu-sabe.svg"
          />
        )}
        <span aria-hidden="true" className="loading-state__indicator" />
        <p className="loading-state__message">{message}</p>
        <p className="loading-state__description">
          Só um instante. Estamos preparando tudo para você.
        </p>
        {action && <div className="loading-state__action">{action}</div>}
      </div>
    </div>
  )
}

export default LoadingState
