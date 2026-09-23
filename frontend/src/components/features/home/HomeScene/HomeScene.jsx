import Button from "../../../common/Button/Button";
import ScenicBackdrop from "../../../common/ScenicBackdrop/ScenicBackdrop";
import SponsorsBar from "../../../common/SponsorsBar/SponsorsBar";
import "./HomeScene.css";

const ILLUSTRATIONS_PATH = "/assets/illustrations";

function HomeScene({ onOpenRankings, onStart }) {
  return (
    <div className="home-scene">
      <img alt="" aria-hidden="true" className="home-scene__sun" decoding="async" fetchPriority="high" src={`${ILLUSTRATIONS_PATH}/sol.svg`} />

      <div className="home-scene__identity">
        <img alt="Vixe, Tu Sabe?" className="home-scene__logo" decoding="async" fetchPriority="high" src="/assets/brand/vixe-tu-sabe.svg" />

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

      <img alt="" aria-hidden="true" className="home-scene__character" decoding="async" fetchPriority="high" src={`${ILLUSTRATIONS_PATH}/personagem-banco.svg`} />
      <img alt="" aria-hidden="true" className="home-scene__house" decoding="async" fetchPriority="high" src={`${ILLUSTRATIONS_PATH}/casa.svg`} />
      <ScenicBackdrop
        fenceClassName="home-scene__fence"
        groundClassName="home-scene__ground"
      />
      <SponsorsBar className="home-scene__sponsors" />
    </div>
  );
}

export default HomeScene;
