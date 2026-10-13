import RankingSummaryCard from "../RankingSummaryCard/RankingSummaryCard";

function ResultRankingList({ school, schoolClass, schoolsTotal, classesTotal }) {
    return (
        <div className="result-rankings__list" aria-live="polite">
            {schoolClass && (
                <RankingSummaryCard
                    description={schoolClass.name}
                    participants={classesTotal}
                    participantLabel="turmas no ranking"
                    position={schoolClass.position}
                    title="Geral de turmas"
                />
            )}
            <RankingSummaryCard
                description={school.name}
                participants={schoolsTotal}
                participantLabel="escolas no ranking"
                position={school.position}
                title="Entre escolas"
            />
            {schoolClass && (
                <RankingSummaryCard
                    description={schoolClass.name}
                    participants={schoolClass.internalTotal}
                    participantLabel="turmas da escola"
                    position={schoolClass.internalPosition}
                    title="Dentro da escola"
                />
            )}
        </div>
    );
}

export default ResultRankingList;
