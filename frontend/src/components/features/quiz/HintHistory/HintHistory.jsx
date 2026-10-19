import "./HintHistory.css";

function HintHistory({ hints }) {
    if (hints.length === 0) return null;

    return (
        <details className="hint-history">
            <summary>
                <span>Dicas usadas</span>
                <span className="hint-history__count">{hints.length}</span>
                <span aria-hidden="true" className="hint-history__arrow">⌃</span>
            </summary>
            <section aria-label="Histórico de dicas desta pergunta" className="hint-history__content" tabIndex={0}>
                <ol>
                    {hints.map((hint, index) => <li key={`${index}-${hint}`}>{hint}</li>)}
                </ol>
            </section>
        </details>
    );
}

export default HintHistory;
