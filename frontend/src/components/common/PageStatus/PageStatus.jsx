import './PageStatus.css'
import LoadingState from '../LoadingState/LoadingState'
import ScenicBackdrop from '../ScenicBackdrop/ScenicBackdrop'

function PageStatus({
  action,
  eyebrow = 'Não deu certo desta vez',
  fullScreen = false,
  message,
  title = 'Eita! Algo saiu do caminho.',
  type = 'loading',
}) {
  if (type === 'loading') {
    return <LoadingState action={action} fullScreen={fullScreen} message={message} />
  }

  const Heading = fullScreen ? 'h1' : 'p'

  return (
    <section
      aria-atomic="true"
      aria-live="assertive"
      className={`page-status page-status--${type}${fullScreen ? ' page-status--full-screen' : ''}`}
      role="alert"
    >
      {fullScreen && (
        <ScenicBackdrop fenceClassName="page-status__fence" groundClassName="page-status__ground" />
      )}

      <div className="page-status__card">
        {fullScreen && (
          <img
            alt=""
            aria-hidden="true"
            className="page-status__brand"
            src="/assets/brand/vixe-tu-sabe.svg"
          />
        )}

        <span aria-hidden="true" className="page-status__icon">
          !
        </span>
        <p className="page-status__eyebrow">{eyebrow}</p>
        <Heading className="page-status__title">{title}</Heading>
        <p className="page-status__message">{message}</p>
        {action && <div className="page-status__action">{action}</div>}
      </div>
    </section>
  )
}

export default PageStatus
