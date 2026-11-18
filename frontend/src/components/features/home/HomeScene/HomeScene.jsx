import Button from '../../../common/Button/Button'
import ScenicBackdrop from '../../../common/ScenicBackdrop/ScenicBackdrop'
import SponsorsBar from '../../../common/SponsorsBar/SponsorsBar'
import './HomeScene.css'

const ILLUSTRATIONS_PATH = '/assets/illustrations'

function HomeScene({ onOpenAdministration, onOpenRankings, onStart }) {
  return (
    <div className="home-scene">
      <img
        alt=""
        aria-hidden="true"
        className="home-scene__sun"
        decoding="async"
        fetchPriority="high"
        src={`${ILLUSTRATIONS_PATH}/sol.svg`}
      />

      <div className="home-scene__identity">
        <img
          alt="Vixe, Tu Sabe?"
          className="home-scene__logo"
          decoding="async"
          fetchPriority="high"
          src="/assets/brand/vixe-tu-sabe.svg"
        />

        <nav aria-label="Ações principais" className="home-scene__actions">
          <Button onClick={onOpenRankings} variant="home-action">
            RANKINGS
          </Button>
          <Button onClick={onStart} variant="home-action">
            INICIAR
          </Button>
        </nav>
      </div>

      <div aria-hidden="true" className="home-scene__character-shadow">
        <img alt="" decoding="async" src={`${ILLUSTRATIONS_PATH}/sombra-cego-aderaldo.svg`} />
      </div>

      <img
        alt=""
        aria-hidden="true"
        className="home-scene__character"
        decoding="async"
        fetchPriority="high"
        src={`${ILLUSTRATIONS_PATH}/personagem-banco.svg`}
      />
      <img
        alt=""
        aria-hidden="true"
        className="home-scene__house"
        decoding="async"
        fetchPriority="high"
        src={`${ILLUSTRATIONS_PATH}/casa.svg`}
      />
      <ScenicBackdrop fenceClassName="home-scene__fence" groundClassName="home-scene__ground" />
      <SponsorsBar className="home-scene__sponsors" />

      <button
        aria-label="Abrir administração"
        className="home-scene__admin"
        onClick={onOpenAdministration}
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10m-10 0h11a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path d="M12 14v2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
        <span>Administração</span>
      </button>
    </div>
  )
}

export default HomeScene
