import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import BackButton from "../../components/common/BackButton/BackButton";
import Button from "../../components/common/Button/Button";
import HomeButton from "../../components/common/HomeButton/HomeButton";
import Pagination from "../../components/common/Pagination/Pagination";
import PageStatus from "../../components/common/PageStatus/PageStatus";
import ScenicBackdrop from "../../components/common/ScenicBackdrop/ScenicBackdrop";
import SelectField from "../../components/common/SelectField/SelectField";
import RankingPodium from "../../components/features/rankings/RankingPodium/RankingPodium";
import RankingTable from "../../components/features/rankings/RankingTable/RankingTable";
import { listarEscolas } from "../../api/escolaApi";
import {
    listarRankingEscolas,
    listarRankingCategoria,
    listarRankingInterno,
    listarRankingTurmas,
} from "../../api/rankingApi";
import { getResult } from "../../utils/storage";
import {
    filterRanking,
    paginateRanking,
    RANKING_PAGE_SIZE,
} from "../../utils/rankingView";

import "./RankingsPage.css";

const CURRENT_YEAR = new Date().getFullYear();

const CATEGORIES = [
    { value: "FUNDAMENTAL_1", label: "Fundamental I" },
    { value: "FUNDAMENTAL_2", label: "Fundamental II" },
    { value: "MEDIO", label: "Ensino Médio" },
];

const RANKING_CONFIG = {
    turmas: {
        label: "Geral de Turmas",
        columns: [
            { key: "escola", label: "Escola" },
            { key: "serieFormatada", label: "Série" },
            { key: "cursoNome", label: "Curso" },
            { key: "turma", label: "Turma" },
            { key: "pontuacaoTotal", label: "Pontuação" },
        ],
    },
    escolas: {
        label: "Entre as Escolas",
        columns: [
            { key: "escola", label: "Escola" },
            { key: "cidade", label: "Cidade" },
            { key: "quantidadePartidas", label: "Partidas" },
            { key: "pontuacaoTotal", label: "Pontuação" },
        ],
    },
    interno: {
        label: "Interno por escola",
        columns: [
            { key: "serieFormatada", label: "Série" },
            { key: "cursoNome", label: "Curso" },
            { key: "turma", label: "Turma" },
            { key: "quantidadePartidas", label: "Partidas" },
            { key: "pontuacaoTotal", label: "Pontuação" },
        ],
    },
    categoria: {
        label: "Por categoria",
        columns: [
            { key: "escola", label: "Escola" },
            { key: "serieFormatada", label: "Série" },
            { key: "cursoNome", label: "Curso" },
            { key: "turma", label: "Turma" },
            { key: "pontuacaoTotal", label: "Pontuação" },
        ],
    },
};

function normalizeClassName(value) {
    return String(value ?? "").trim().toLocaleUpperCase("pt-BR");
}

function buildSchoolKey(schoolId) {
    return `escola:${schoolId ?? ""}`;
}

function buildClassKey({ escolaId, etapaEnsino, serie, turma, cursoId }) {
    return [
        "turma",
        escolaId ?? "",
        etapaEnsino ?? "FUNDAMENTAL",
        Number(serie),
        cursoId ?? "SEM_CURSO",
        normalizeClassName(turma),
    ].join(":");
}

function getCurrentClasses(result) {
    if (!result) {
        return [];
    }

    const schoolResults = Array.isArray(result.resultados)
        ? result.resultados
        : [result];

    return schoolResults.flatMap((schoolResult) =>
        (schoolResult.turmas ?? []).map((schoolClass) => ({
            escolaId: schoolResult.escola?.id,
            etapaEnsino: schoolClass.etapaEnsino,
            serie: schoolClass.serie,
            turma: schoolClass.turma,
            cursoId: schoolClass.cursoId,
        })),
    );
}

function RankingsPage() {
    const showRecentResult = useLocation().state?.highlightRecentResult === true;
    const recentResult = useMemo(
        () => showRecentResult ? getResult() : null,
        [showRecentResult],
    );
    const recentCategory = recentResult?.partida?.categoriaQuiz;
    const [activeRanking, setActiveRanking] = useState("turmas");
    const [selectedCategory, setSelectedCategory] = useState(() =>
        CATEGORIES.some(({ value }) => value === recentCategory)
            ? recentCategory : "FUNDAMENTAL_1",
    );
    const [schools, setSchools] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const currentClasses = useMemo(
        () => getCurrentClasses(recentResult),
        [recentResult],
    );
    const filteredRecords = useMemo(
        () => filterRanking(records, search),
        [records, search],
    );
    const totalPages = Math.max(
        1,
        Math.ceil(filteredRecords.length / RANKING_PAGE_SIZE),
    );
    const visibleRecords = paginateRanking(filteredRecords, page);

    useEffect(() => {
        let isActive = true;

        listarEscolas()
            .then((response) => {
                if (!isActive) return;

                setSchools(response);
                setSelectedSchoolId((current) => {
                    const preferredSchoolId = currentClasses[0]?.escolaId;
                    const preferredSchoolExists = response.some(
                        (school) => school.id === preferredSchoolId,
                    );

                    return (
                        current ||
                        (preferredSchoolExists ? preferredSchoolId : "") ||
                        response[0]?.id ||
                        ""
                    );
                });
            })
            .catch(() => {
                if (isActive) setSchools([]);
            });

        return () => {
            isActive = false;
        };
    }, [currentClasses]);

    useEffect(() => {
        let isActive = true;
        let request;

        if (activeRanking === "turmas") {
            request = listarRankingTurmas({ ano: CURRENT_YEAR });
        } else if (activeRanking === "escolas") {
            request = listarRankingEscolas({ ano: CURRENT_YEAR });
        } else if (activeRanking === "categoria") {
            request = listarRankingCategoria(selectedCategory, { ano: CURRENT_YEAR });
        } else if (selectedSchoolId) {
            request = listarRankingInterno(selectedSchoolId, {
                ano: CURRENT_YEAR,
            });
        } else {
            request = Promise.resolve({ ranking: [] });
        }

        request
            .then((response) => {
                if (isActive) setRecords(response.ranking ?? []);
            })
            .catch((requestError) => {
                if (isActive) setError(requestError.message);
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [activeRanking, loadAttempt, selectedSchoolId, selectedCategory]);

    const config = RANKING_CONFIG[activeRanking];
    const highlightedKeys = useMemo(() => {
        if (activeRanking === "categoria" && selectedCategory !== recentCategory) {
            return new Set();
        }
        if (activeRanking === "escolas") {
            return new Set(
                currentClasses.map(({ escolaId }) => buildSchoolKey(escolaId)),
            );
        }

        return new Set(
            currentClasses
                .filter(
                    ({ escolaId }) =>
                        activeRanking !== "interno" ||
                        escolaId === selectedSchoolId,
                )
                .map(buildClassKey),
        );
    }, [activeRanking, currentClasses, selectedSchoolId, selectedCategory, recentCategory]);

    function getRecordKey(record) {
        if (activeRanking === "escolas") {
            return buildSchoolKey(record.escolaId);
        }

        return buildClassKey({
            ...record,
            escolaId:
                activeRanking === "interno"
                    ? selectedSchoolId
                    : record.escolaId,
        });
    }

    function changeRanking(newRanking) {
        if (newRanking === activeRanking) return;
        setPage(1);
        setActiveRanking(newRanking);
        setRecords([]);
        setError("");
        setIsLoading(true);
    }

    function changeSchool(schoolId) {
        if (schoolId === selectedSchoolId) return;
        setPage(1);
        setSelectedSchoolId(schoolId);
        setRecords([]);
        setError("");
        setIsLoading(true);
    }

    function changeCategory(category) {
        if (category === selectedCategory) return;
        setPage(1);
        setSelectedCategory(category);
        setRecords([]);
        setError("");
        setIsLoading(true);
    }

    function retryRanking() {
        setError("");
        setIsLoading(true);
        setLoadAttempt((value) => value + 1);
    }

    function changeSearch(value) {
        setSearch(value);
        setPage(1);
    }

    return (
        <section className="rankings-page">
            <ScenicBackdrop
                fenceClassName="rankings-page__fence"
                groundClassName="rankings-page__ground"
            />

            <main className="rankings-page__panel">
                <header className="rankings-page__header">
                    <BackButton fallback="/" />
                    <h1>Rankings</h1>
                    <HomeButton className="rankings-page__home" />
                </header>

                <nav aria-label="Tipos de ranking" className="rankings-page__tabs">
                    {Object.entries(RANKING_CONFIG).map(([key, item]) => (
                        <button
                            aria-pressed={activeRanking === key}
                            key={key}
                            onClick={() => changeRanking(key)}
                            type="button"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="rankings-page__filters">
                    <label className="rankings-page__search">
                        <span>Pesquisar no ranking</span>
                        <input
                            onChange={(event) => changeSearch(event.target.value)}
                            placeholder="Escola, série, curso ou turma"
                            type="search"
                            value={search}
                        />
                    </label>

                {activeRanking === "interno" && (
                    <label className="rankings-page__school">
                        <span>Selecione a escola</span>
                        <select
                            disabled={schools.length === 0}
                            onChange={(event) => changeSchool(event.target.value)}
                            value={selectedSchoolId}
                        >
                            {schools.length === 0 && (
                                <option value="">Nenhuma escola cadastrada</option>
                            )}

                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.nome} — {school.cidade}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                {activeRanking === "categoria" && (
                    <div className="rankings-page__school">
                        <SelectField
                            id="ranking-category"
                            label="Selecione a categoria"
                            onChange={changeCategory}
                            options={CATEGORIES}
                            placeholder="Selecione a categoria"
                            value={selectedCategory}
                        />
                    </div>
                )}
                </div>

                {isLoading ? (
                    <PageStatus message="Carregando ranking..." />
                ) : error ? (
                    <PageStatus
                        action={
                            <Button onClick={retryRanking}>
                                Tentar novamente
                            </Button>
                        }
                        message={error}
                        type="error"
                    />
                ) : (
                    <>
                        {filteredRecords.length > 0 && <details className="rankings-page__highlights">
                            <summary>Destaques do ranking</summary>
                            <RankingPodium records={filteredRecords} />
                        </details>}
                        <RankingTable
                            columns={config.columns}
                            getRecordKey={getRecordKey}
                            highlightedKeys={highlightedKeys}
                            records={visibleRecords}
                        />
                        <Pagination
                            onChange={setPage}
                            page={page}
                            totalPages={totalPages}
                        />
                    </>
                )}
            </main>
        </section>
    );
}

export default RankingsPage;
