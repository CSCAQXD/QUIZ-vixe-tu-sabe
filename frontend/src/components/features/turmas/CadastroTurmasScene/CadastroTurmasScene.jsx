import ScenicBackdrop from "../../../common/ScenicBackdrop/ScenicBackdrop";
import "./CadastroTurmasScene.css";

function CadastroTurmasScene() {
  return (
    <aside aria-hidden="true" className="registration-scene">
      <img
        alt=""
        className="registration-scene__logo"
        src="/assets/brand/vixe-tu-sabe.svg"
      />
      <ScenicBackdrop
        fenceClassName="registration-scene__fence"
        groundClassName="registration-scene__ground"
      />
    </aside>
  );
}

export default CadastroTurmasScene;
