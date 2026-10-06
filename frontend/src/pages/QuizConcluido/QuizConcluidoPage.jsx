import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import {
    listarRankingEscolas,
    listarRankingTurmas,
} from "../../api/rankingApi";
import Button from "../../components/common/Button/Button";
import HomeButton from "../../components/common/HomeButton/HomeButton";
import ScenicBackdrop from "../../components/common/ScenicBackdrop/ScenicBackdrop";
import RankingSummaryCard from "../../components/features/rankings/RankingSummaryCard/RankingSummaryCard";
import { getResult } from "../../utils/storage";

import "./QuizConcluidoPage.css";

function normalize(value) {
    return String(value ?? "").trim().toLocaleUpperCase("pt-BR");
}

function formatClass(schoolClass) {
    const educationLevel =
        schoolClass.etapaEnsino === "MEDIO" ? "Ensino Médio" : "Ensino Fundamental";

    const course = schoolClass.cursoNome
        ? ` · ${schoolClass.cursoNome}`
        : "";
    const division = schoolClass.turma === "UNICA"
        ? "Turma única"
        : `Turma ${schoolClass.turma}`;

    return `${schoolClass.serie}º ano — ${educationLevel}${course} · ${division}`;
}

function classRankingKey(schoolId, schoolClass) {
    return [
        schoolId,
        schoolClass.etapaEnsino,
        Number(schoolClass.serie),
        schoolClass.cursoId ?? "SEM_CURSO",
        normalize(schoolClass.turma),
    ].join("|||");
}

function QuizConcluidoPage() {
    const navigate = useNavigate();
    const result = useMemo(() => getResult(), []);
    const [rankingData, setRankingData] = useState({
        schools: [],
        schoolsTotal: 0,
        classes: [],
        classesTotal: 0,
    });
    const [rankingError, setRankingError] = useState("");

    const rankingResults = useMemo(() => {
        if (!result) return [];
        return Array.isArray(result.resultados) ? result.resultados : [result];
    }, [result]);
    const schoolsById = useMemo(
        () => new Map(rankingData.schools.map((item) => [item.escolaId, item])),
        [rankingData.schools],
    );
    const classesByKey = useMemo(
        () =>
            new Map(
                rankingData.classes.map((item) => [
                    classRankingKey(item.escolaId, item),
                    item,
                ]),
            ),
        [rankingData.classes],
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
                if (isActive) {
                    setRankingError("Não foi possível atualizar todos os rankings.");
                }
            });

        return () => {
            isActive = false;
        };
    }, [rankingResults, result]);

    if (!result) {
        return <Navigate replace to="/" />;
    }

    const finalScore = result.partida?.pontuacaoFinal ?? 0;

    return (
        <section className="completed-page">
            <ScenicBackdrop
                fenceClassName="completed-page__fence"
                groundClassName="completed-page__ground"
            />

            <main className="completed-page__panel">
                <h1>PARABÉNS</h1>
                <p className="completed-page__success">QUIZ CONCLUÍDO COM SUCESSO</p>

                <div className="completed-page__score">
                    <span>PONTUAÇÃO FINAL</span>
                    <strong>{finalScore}</strong>
                    <b>PONTOS</b>
                </div>

                <section className="completed-page__rankings">
                    <h2>SUA PONTUAÇÃO NOS RANKINGS</h2>

                    {rankingError && (
                        <p className="completed-page__ranking-warning">
                            {rankingError}
                        </p>
                    )}

                    {rankingResults.map((schoolResult) => {
                        const schoolRanking = schoolsById.get(
                            schoolResult.escola?.id,
                        );

                        return (
                            <section
                                className="completed-page__school"
                                key={schoolResult.escola?.id ?? schoolResult.partida?.id}
                            >
                                <h3>{schoolResult.escola?.nome}</h3>

                                <div className="completed-page__cards">
                                    {schoolResult.turmas?.map((schoolClass) => {
                                        const classRanking = classesByKey.get(
                                            classRankingKey(
                                                schoolResult.escola?.id,
                                                schoolClass,
                                            ),
                                        );

                                        return (
                                            <RankingSummaryCard
                                                description={`${schoolResult.escola?.nome} · ${formatClass(schoolClass)}`}
                                                key={`geral-${schoolClass.id}`}
                                                participants={rankingData.classesTotal || "—"}
                                                position={classRanking?.posicao}
                                                title="RANKING GERAL DE TURMAS"
                                            />
                                        );
                                    })}

                                    <RankingSummaryCard
                                        description={schoolResult.escola?.nome}
                                        participants={rankingData.schoolsTotal || "—"}
                                        position={schoolRanking?.posicao}
                                        title="RANKING ENTRE ESCOLAS"
                                        tone="green"
                                    />

                                    {schoolResult.turmas?.map((schoolClass) => (
                                        <RankingSummaryCard
                                            description={formatClass(schoolClass)}
                                            key={`interno-${schoolClass.id}`}
                                            participants={
                                                schoolClass.totalTurmasNoRankingInterno ?? "—"
                                            }
                                            position={schoolClass.posicaoRankingInterno}
                                            title="RANKING INTERNO POR ESCOLA"
                                            tone="orange"
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </section>

                <div className="completed-page__actions">
                    <Button
                        className="completed-page__rankings-button"
                        onClick={() => navigate("/rankings")}
                    >
                        VER TODOS OS RANKINGS
                    </Button>
                    <HomeButton className="completed-page__home-button" />
                </div>
            </main>
        </section>
    );
}

export default QuizConcluidoPage;
