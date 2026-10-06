import "./Pagination.css";

function Pagination({ onChange, page, totalPages }) {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Paginação do ranking" className="pagination">
            <button
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
                type="button"
            >
                Anterior
            </button>
            <span aria-live="polite">
                Página <strong>{page}</strong> de {totalPages}
            </span>
            <button
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
                type="button"
            >
                Próxima
            </button>
        </nav>
    );
}

export default Pagination;
