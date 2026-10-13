import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { listarRankingEscolas, listarRankingTurmas } from "../../api/rankingApi";
import Button from "../../components/common/Button/Button";
import HomeButton from "../../components/common/HomeButton/HomeButton";
import ScenicBackdrop from "../../components/common/ScenicBackdrop/ScenicBackdrop";
import ResultRankings from "../../components/features/rankings/ResultRankings/ResultRankings";
import { buildResultGroups } from "../../utils/completion";
import { getResult } from "../../utils/storage";
import "./QuizConcluidoPage.css";

function QuizConcluidoPage() {
    const navigate = useNavigate();
    const result = useMemo(() => getResult(), []);
    const [rankingData, setRankingData] = useState({
        schools: [], schoolsTotal: 0, classes: [], classesTotal: 0,
    });
    const [rankingError, setRankingError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const rankingResults = useMemo(() => {
        if (!result) return [];
        return Array.isArray(result.resultados) ? result.resultados : [result];
    }, [result]);
    const groups = useMemo(
        () => buildResultGroups(rankingResults, rankingData),
        [rankingResults, rankingData],
    );

    useEffect(() => {
        if (!result) return undefined;
        let isActive = true;
        const year = result.partida?.ano ?? rankingResults[0]?.partida?.ano;
        Promise.all([
            listarRankingTurmas({ ano: year }),
            listarRankingEscolas({ ano: year }),
        ])
            .then(([classResponse, schoolResponse]) => {
                if (!isActive) return;
                setRankingData({
                    schools: schoolResponse.ranking ?? [],
                    schoolsTotal: schoolResponse.total ?? 0,
                    classes: classResponse.ranking ?? [],
                    classesTotal: classResponse.total ?? 0,
                });
            })
            .catch(() => {
                if (isActive) setRankingError(
                    "As posições não puderam ser atualizadas. Sua pontuação está salva. Abra os rankings para tentar novamente.",
                );
            })
            .finally(() => { if (isActive) setIsLoading(false); });
        return () => { isActive = false; };
    }, [rankingResults, result]);

    if (!result) return <Navigate replace to="/" />;
    const finalScore = result.partida?.pontuacaoFinal ?? 0;
    const schoolNames = [...new Set(groups.map((group) => group.name))];

    return (
        <section className="completed-page">
            <ScenicBackdrop fenceClassName="completed-page__fence"
                groundClassName="completed-page__ground" />
            <main className="completed-page__panel">
                <section className="completed-page__overview" aria-labelledby="completion-title">
                    <span className="completed-page__eyebrow">Mediação concluída</span>
                    <h1 id="completion-title">Parabéns!</h1>
                    <p className="completed-page__success">Vocês concluíram o quiz.</p>
                    <div className="completed-page__score">
                        <span>Pontuação final</span>
                        <strong>{finalScore.toLocaleString("pt-BR")}</strong>
                        <b>pontos</b>
                    </div>
                    <div className="completed-page__schools">
                        {schoolNames.map((name) => <p key={name}>{name}</p>)}
                    </div>
                </section>
                <div className="completed-page__details">
                    <ResultRankings groups={groups} isLoading={isLoading}
                        error={rankingError} schoolsTotal={rankingData.schoolsTotal}
                        classesTotal={rankingData.classesTotal} />
                    <div className="completed-page__actions">
                        <Button className="completed-page__rankings-button"
                            onClick={() => navigate("/rankings")}>
                            Ver todos os rankings
                        </Button>
                        <HomeButton className="completed-page__home-button" />
                    </div>
                </div>
            </main>
        </section>
    );
}

export default QuizConcluidoPage;
