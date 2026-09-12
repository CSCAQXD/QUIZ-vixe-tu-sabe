import { useNavigate } from "react-router-dom";
import HomeScene from "../../components/features/home/HomeScene/HomeScene";
import { clearQuizStorage } from "../../utils/storage";
import "./TelaInicialPage.css";

function TelaInicialPage() {
  const navigate = useNavigate();

  function startQuiz() {
    clearQuizStorage();
    navigate("/cadastro-turmas");
  }

  return (
    <section aria-label="Tela inicial do Vixe, Tu Sabe?" className="home-page">
      <HomeScene onOpenRankings={() => navigate("/rankings")} onStart={startQuiz} />
    </section>
  );
}

export default TelaInicialPage;
