import {
    useCallback,
    useEffect,
    useState,
} from "react";

import BackButton from "../../components/common/BackButton/BackButton";
import Button from "../../components/common/Button/Button";
import PageStatus from "../../components/common/PageStatus/PageStatus";
import RankingTable from "../../components/features/rankings/RankingTable/RankingTable";
import { listarEscolas } from "../../api/escolaApi";
import {
    listarRankingEscolas,
    listarRankingInterno,
    listarRankingTurmas,
} from "../../api/rankingApi";

import "./RankingsPage.css";

const CURRENT_YEAR =
    new Date().getFullYear();

const RANKING_CONFIG = {
    turmas: {
        title: "Ranking geral de turmas",
        columns: [
        {
            key: "escola",
            label: "Escola",
        },
        {
            key: "cidade",
            label: "Cidade",
        },
        {
            key: "serie",
            label: "Série",
        },
        {
            key: "turma",
            label: "Turma",
        },
        {
            key: "pontuacaoTotal",
            label: "Pontuação",
        },
        ],
    },

    escolas: {
        title: "Ranking entre escolas",
        columns: [
        {
            key: "escola",
            label: "Escola",
        },
        {
            key: "cidade",
            label: "Cidade",
        },
        {
            key: "quantidadePartidas",
            label: "Partidas",
        },
        {
            key: "pontuacaoTotal",
            label: "Pontuação",
        },
        ],
    },

    interno: {
        title: "Ranking interno por escola",
        columns: [
        {
            key: "serie",
            label: "Série",
        },
        {
            key: "turma",
            label: "Turma",
        },
        {
            key: "quantidadePartidas",
            label: "Partidas",
        },
        {
            key: "pontuacaoTotal",
            label: "Pontuação",
        },
        ],
    },
};

function RankingsPage() {
    const [activeRanking, setActiveRanking] =
        useState("turmas");

    const [year, setYear] =
        useState(CURRENT_YEAR);

    const [schools, setSchools] =
        useState([]);

    const [selectedSchoolId, setSelectedSchoolId] =
        useState("");

    const [records, setRecords] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadSchools =
        useCallback(async () => {
        try {
            const response =
            await listarEscolas();

            setSchools(response);

            setSelectedSchoolId(
            (current) =>
                current ||
                response[0]?.id ||
                "",
            );
        } catch (requestError) {
            setError(
            requestError.message,
            );
        }
        }, []);

    useEffect(() => {
        loadSchools();
    }, [loadSchools]);

    const loadRanking =
        useCallback(async () => {
        if (
            activeRanking === "interno" &&
            !selectedSchoolId
        ) {
            setRecords([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            let response;

            if (activeRanking === "turmas") {
            response =
                await listarRankingTurmas({
                ano: year,
                });
            } else if (
            activeRanking === "escolas"
            ) {
            response =
                await listarRankingEscolas({
                ano: year,
                });
            } else {
            response =
                await listarRankingInterno(
                selectedSchoolId,
                {
                    ano: year,
                },
                );
            }

            setRecords(
            response.ranking ?? [],
            );
        } catch (requestError) {
            setError(
            requestError.message,
            );
        } finally {
            setIsLoading(false);
        }
        }, [
        activeRanking,
        selectedSchoolId,
        year,
        ]);

    useEffect(() => {
        loadRanking();
    }, [loadRanking]);

    const config =
        RANKING_CONFIG[activeRanking];

    return (
        <section className="rankings-page">
        <header className="rankings-page__header">
            <div>
            <BackButton fallback="/" />
            <h1>Rankings</h1>
            </div>

            <label className="rankings-page__year">
            Ano

            <input
                max={2100}
                min={2000}
                onChange={(event) =>
                setYear(
                    Number(
                    event.target.value,
                    ),
                )
                }
                type="number"
                value={year}
            />
            </label>
        </header>

        <nav
            aria-label="Tipos de ranking"
            className="rankings-page__tabs"
        >
            <button
            aria-pressed={
                activeRanking === "turmas"
            }
            onClick={() =>
                setActiveRanking("turmas")
            }
            type="button"
            >
            Geral de turmas
            </button>

            <button
            aria-pressed={
                activeRanking === "escolas"
            }
            onClick={() =>
                setActiveRanking("escolas")
            }
            type="button"
            >
            Entre as escolas
            </button>

            <button
            aria-pressed={
                activeRanking === "interno"
            }
            onClick={() =>
                setActiveRanking("interno")
            }
            type="button"
            >
            Interno por escola
            </button>
        </nav>

        {activeRanking === "interno" && (
            <label className="rankings-page__school">
            Selecione a escola

            <select
                onChange={(event) =>
                setSelectedSchoolId(
                    event.target.value,
                )
                }
                value={selectedSchoolId}
            >
                {schools.length === 0 && (
                <option value="">
                    Nenhuma escola cadastrada
                </option>
                )}

                {schools.map((school) => (
                <option
                    key={school.id}
                    value={school.id}
                >
                    {school.nome} —{" "}
                    {school.cidade}
                </option>
                ))}
            </select>
            </label>
        )}

        <article className="rankings-page__panel">
            <h2>{config.title}</h2>

            {isLoading ? (
            <PageStatus
                message="Carregando ranking..."
            />
            ) : error ? (
            <PageStatus
                action={
                <Button
                    onClick={loadRanking}
                >
                    Tentar novamente
                </Button>
                }
                message={error}
                type="error"
            />
            ) : (
            <RankingTable
                columns={config.columns}
                records={records}
            />
            )}
        </article>
        </section>
    );
}

export default RankingsPage;