import { useState } from "react";
import ResultRankingList from "./ResultRankingList";
import "./ResultRankings.css";

function ResultRankings({ groups, schoolsTotal, classesTotal, isLoading, error }) {
    const [schoolIndex, setSchoolIndex] = useState(0);
    const [classIndex, setClassIndex] = useState(0);
    const school = groups[schoolIndex] ?? groups[0];
    const schoolClass = school?.classes[classIndex] ?? school?.classes[0];

    return (
        <section className="result-rankings" aria-labelledby="result-rankings-title">
            <header>
                <h2 id="result-rankings-title">Sua posição nos rankings</h2>
                <p>Veja como foi a participação nesta mediação.</p>
            </header>
            {(groups.length > 1 || school?.classes.length > 1) && (
                <div className="result-rankings__filters">
                    {groups.length > 1 && (
                        <label>
                            Escola
                            <select value={schoolIndex} onChange={(event) => {
                                setSchoolIndex(Number(event.target.value));
                                setClassIndex(0);
                            }}>
                                {groups.map((item, index) => (
                                    <option key={index} value={index}>{item.name}</option>
                                ))}
                            </select>
                        </label>
                    )}
                    {school?.classes.length > 1 && (
                        <label>
                            Turma
                            <select value={classIndex} onChange={(event) => {
                                setClassIndex(Number(event.target.value));
                            }}>
                                {school.classes.map((item, index) => (
                                    <option key={index} value={index}>{item.name}</option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
            )}
            {isLoading ? <p role="status">Atualizando posições…</p> : school && (
                <ResultRankingList school={school} schoolClass={schoolClass}
                    schoolsTotal={schoolsTotal} classesTotal={classesTotal} />
            )}
            {error && <p className="result-rankings__warning" role="status">{error}</p>}
        </section>
    );
}

export default ResultRankings;
