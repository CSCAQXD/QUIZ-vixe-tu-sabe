import "./RankingPodium.css";

const PODIUM_ORDER = [1, 0, 2];

function RankingPodium({ records }) {
    const topThree = records.slice(0, 3);

    if (topThree.length === 0) {
        return null;
    }

    return (
        <section aria-label="Pódio do ranking" className="ranking-podium">
        {PODIUM_ORDER.map((recordIndex) => {
            const record = topThree[recordIndex];
            const position = recordIndex + 1;

            if (!record) {
                return (
                    <div
                        aria-hidden="true"
                        className={`ranking-podium__place ranking-podium__place--${position} ranking-podium__place--empty`}
                        key={position}
                    />
                );
            }

            return (
                <article
                    aria-label={`${position}º lugar, ${record.pontuacaoTotal} pontos`}
                    className={`ranking-podium__place ranking-podium__place--${position}`}
                    key={`${position}-${record.escolaId ?? record.escola ?? record.turma}`}
                >
                    <strong>{record.pontuacaoTotal}</strong>
                    <span>PONTOS</span>
                    <b aria-hidden="true">{position}</b>
                </article>
            );
        })}
        </section>
    );
}

export default RankingPodium;
