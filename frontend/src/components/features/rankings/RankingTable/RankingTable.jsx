import {
    useEffect,
    useRef,
} from "react";

import "./RankingTable.css";

function RankingTable({
    columns,
    getRecordKey,
    highlightedKeys = new Set(),
    records,
}) {
    const scrollRef = useRef(null);
    const highlightedRowRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        const highlightedRow = highlightedRowRef.current;

        if (!scrollContainer || !highlightedRow) {
            return undefined;
        }

        const frame = window.requestAnimationFrame(() => {
            scrollContainer.scrollTo({
                behavior: "smooth",
                top: Math.max(
                    0,
                    highlightedRow.offsetTop -
                        scrollContainer.clientHeight / 2 +
                        highlightedRow.clientHeight / 2,
                ),
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [highlightedKeys, records]);

    if (records.length === 0) {
        return (
            <p className="ranking-table__empty">
                Ainda não há pontuações neste ranking.
            </p>
        );
    }

    const firstHighlightedKey = records
        .map(getRecordKey)
        .find((recordKey) => highlightedKeys.has(recordKey));

    return (
        <div className="ranking-table" ref={scrollRef}>
            <table>
                <thead>
                    <tr>
                        <th scope="col">#</th>

                        {columns.map((column) => (
                            <th key={column.key} scope="col">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {records.map((record, index) => {
                        const recordKey = getRecordKey(record);
                        const isHighlighted = highlightedKeys.has(recordKey);
                        const shouldReceiveRef = recordKey === firstHighlightedKey;

                        return (
                            <tr
                                aria-current={isHighlighted ? "true" : undefined}
                                className={
                                    isHighlighted
                                        ? "ranking-table__row ranking-table__row--current"
                                        : "ranking-table__row"
                                }
                                key={recordKey || index}
                                ref={shouldReceiveRef ? highlightedRowRef : null}
                            >
                                <td>{record.posicao ?? index + 1}</td>

                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {record[column.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default RankingTable;
