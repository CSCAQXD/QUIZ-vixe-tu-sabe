import "./RankingTable.css";

function RankingTable({
    columns,
    records,
}) {
    if (records.length === 0) {
        return (
        <p className="ranking-table__empty">
            Nenhum resultado encontrado para este
            ranking.
        </p>
        );
    }

    return (
        <div className="ranking-table__scroll">
        <table className="ranking-table">
            <thead>
            <tr>
                <th>Posição</th>

                {columns.map((column) => (
                <th key={column.key}>
                    {column.label}
                </th>
                ))}
            </tr>
            </thead>

            <tbody>
            {records.map((record) => (
                <tr
                key={
                    record.id ??
                    `${record.posicao}-${record.escola ?? ""}-${record.turma ?? ""}`
                }
                >
                <td>
                    <span
                    className={`ranking-table__position ranking-table__position--${record.posicao}`}
                    >
                    {record.posicao}
                    </span>
                </td>

                {columns.map((column) => (
                    <td key={column.key}>
                    {record[column.key] ?? "—"}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}

export default RankingTable;