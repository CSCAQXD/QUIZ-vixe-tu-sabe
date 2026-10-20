import './RankingPodium.css'

function RankingPodium({ records }) {
  const topThree = records.slice(0, 3)

  if (topThree.length === 0) {
    return null
  }

  return (
    <section aria-label="Pódio do ranking" className="ranking-podium">
      {topThree.map((record, index) => {
        const position = index + 1
        const title = record.escola ?? record.serieFormatada ?? `Turma ${record.turma}`
        const description = record.escola
          ? [record.serieFormatada, record.turma && `Turma ${record.turma}`]
              .filter(Boolean)
              .join(' · ')
          : record.turma && `Turma ${record.turma}`

        return (
          <article
            aria-label={`${position}º lugar, ${record.pontuacaoTotal} pontos`}
            className={`ranking-podium__place ranking-podium__place--${position}`}
            key={`${position}-${record.escolaId ?? record.escola ?? record.turma}`}
          >
            <b aria-hidden="true">{position}º</b>
            <div className="ranking-podium__identity">
              <strong title={title}>{title}</strong>
              {description && <span title={description}>{description}</span>}
            </div>
            <span className="ranking-podium__points">{record.pontuacaoTotal} pts</span>
          </article>
        )
      })}
    </section>
  )
}

export default RankingPodium
