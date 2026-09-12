import SponsorsBar from "../../../common/SponsorsBar/SponsorsBar";
import "./HomeScene.css";

const ILLUSTRATIONS_PATH = "/assets/illustrations";

function HomeScene({ onOpenRankings, onStart }) {
  return (
    <div className="home-scene">
      <img alt="" aria-hidden="true" className="home-scene__sun" src={`${ILLUSTRATIONS_PATH}/sol.svg`} />

      <div className="home-scene__identity">
        <img alt="Vixe, Tu Sabe?" className="home-scene__logo" src="/assets/brand/vixe-tu-sabe.svg" />

        <nav aria-label="Ações principais" className="home-scene__actions">
          <button className="home-scene__button" onClick={onOpenRankings} type="button">
            RANKINGS
          </button>
          <button className="home-scene__button" onClick={onStart} type="button">
            INICIAR
          </button>
        </nav>
      </div>

      <div aria-hidden="true" className="home-scene__character-shadow">
        <img alt="" src={`${ILLUSTRATIONS_PATH}/sombra-cego-aderaldo.svg`} />
      </div>

      <img alt="" aria-hidden="true" className="home-scene__character" src={`${ILLUSTRATIONS_PATH}/personagem-banco.svg`} />
      <img alt="" aria-hidden="true" className="home-scene__house" src={`${ILLUSTRATIONS_PATH}/casa.svg`} />
      <img alt="" aria-hidden="true" className="home-scene__fence" src={`${ILLUSTRATIONS_PATH}/cerca.svg`} />
      <img alt="" aria-hidden="true" className="home-scene__ground" src={`${ILLUSTRATIONS_PATH}/muro-tijolos.svg`} />
      <SponsorsBar className="home-scene__sponsors" />
    </div>
  );
}

export default HomeScene;
