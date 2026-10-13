import "./RankingSummaryCard.css";

function RankingSummaryCard({
    description,
    participants,
    participantLabel = "participantes",
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
                    {participants > 0 && <span>{participants} {participantLabel}</span>}
                </div>

                <span
                    aria-label={`${position ?? "Sem"} posição no ranking`}
                    className="ranking-summary__position"
                >
                    {position ? `${position}º` : "—"}
                </span>
            </div>
        </article>
    );
}

export default RankingSummaryCard;
