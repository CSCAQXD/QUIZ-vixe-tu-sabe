import "./RankingSummaryCard.css";

function RankingSummaryCard({
    description,
    participants,
    position,
    title,
    tone = "wine",
}) {
    return (
        <article className={`ranking-summary ranking-summary--${tone}`}>
            <h3>{title}</h3>

            <div className="ranking-summary__content">
                <div>
                    <strong>{description}</strong>
                    <span>{participants} participantes</span>
                </div>

                <span
                    aria-label={`${position ?? "Sem"} posição no ranking`}
                    className="ranking-summary__position"
                >
                    {position ?? "—"}
                </span>
            </div>
        </article>
    );
}

export default RankingSummaryCard;
