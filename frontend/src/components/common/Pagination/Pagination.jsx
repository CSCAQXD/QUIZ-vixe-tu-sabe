import "./Pagination.css";

function getPageItems(page, totalPages) {
    const start = Math.max(1, Math.min(page - 1, totalPages - 2));
    const pages = new Set([1, totalPages]);

    for (let value = start; value <= Math.min(start + 2, totalPages); value += 1) {
        pages.add(value);
    }

    return [...pages].sort((a, b) => a - b).flatMap((value, index, values) => {
        const previous = values[index - 1];
        return previous && value - previous > 1
            ? [`ellipsis-${previous}`, value]
            : [value];
    });
}

function Pagination({ onChange, page, totalPages }) {
    if (totalPages <= 1) return null;

    const items = getPageItems(page, totalPages);

    return (
        <nav aria-label="Paginação do ranking" className="pagination">
            <button
                aria-label="Página anterior"
                className="pagination__arrow"
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
                type="button"
            >
                ‹
            </button>
            {items.map((item) =>
                typeof item === "number" ? (
                    <button
                        aria-current={item === page ? "page" : undefined}
                        aria-label={`Página ${item}`}
                        className="pagination__page"
                        key={item}
                        onClick={() => onChange(item)}
                        type="button"
                    >
                        {item}
                    </button>
                ) : (
                    <span aria-hidden="true" className="pagination__ellipsis" key={item}>
                        …
                    </span>
                )
            )}
            <button
                aria-label="Próxima página"
                className="pagination__arrow"
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
                type="button"
            >
                ›
            </button>
        </nav>
    );
}

export default Pagination;
