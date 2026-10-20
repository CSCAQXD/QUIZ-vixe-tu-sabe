import { useMemo, useState } from "react";
import {
    findExactMunicipality,
    findMunicipalityMatches,
    normalizeMunicipalityText,
} from "../../../../utils/municipios";
import "../../../common/FormField/FormField.css";
import "./CidadeAutocomplete.css";

const MAX_SUGGESTIONS = 8;

function CidadeAutocomplete({
    cidade,
    cidadeUf,
    error = "",
    id,
    onBlur,
    onChange,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const errorId = `${id}-error`;
    const helpId = `${id}-help`;
    const listId = `${id}-suggestions`;
    const canSearch = normalizeMunicipalityText(cidade).replace(/\s/g, "").length >= 2;
    const suggestions = useMemo(
        () => canSearch
            ? findMunicipalityMatches(cidade, MAX_SUGGESTIONS)
            : [],
        [canSearch, cidade],
    );
    const showSuggestions = isOpen && canSearch;

    function selectMunicipality(municipality) {
        onChange({
            cidade: municipality.nome,
            cidadeUf: municipality.uf,
            municipioIbgeId: municipality.id,
        });
        setActiveIndex(-1);
        setIsOpen(false);
    }

    function handleBlur() {
        const exactMatch = findExactMunicipality(cidade, cidadeUf);
        if (exactMatch) selectMunicipality(exactMatch);
        else setIsOpen(false);
        onBlur?.();
    }

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            setActiveIndex(-1);
            setIsOpen(false);
            return;
        }

        if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;

        if (event.key === "Enter") {
            if (showSuggestions && activeIndex >= 0) {
                event.preventDefault();
                selectMunicipality(suggestions[activeIndex]);
            }
            return;
        }

        if (suggestions.length === 0) return;

        event.preventDefault();
        setIsOpen(true);
        setActiveIndex((current) => {
            if (event.key === "ArrowDown") {
                return current >= suggestions.length - 1 ? 0 : current + 1;
            }
            return current <= 0 ? suggestions.length - 1 : current - 1;
        });
    }

    return (
        <div className="form-field city-autocomplete">
            <label className="form-field__label" htmlFor={id}>
                Cidade
            </label>

            <div className="city-autocomplete__control">
                <input
                    aria-activedescendant={
                        showSuggestions && activeIndex >= 0
                            ? `${id}-option-${activeIndex}`
                            : undefined
                    }
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
                    aria-expanded={showSuggestions}
                    aria-haspopup="listbox"
                    aria-invalid={Boolean(error)}
                    autoComplete="off"
                    className={`form-field__input${cidadeUf ? " city-autocomplete__input--selected" : ""}`}
                    id={id}
                    maxLength={120}
                    onBlur={handleBlur}
                    onChange={(event) => {
                        onChange({
                            cidade: event.target.value,
                            cidadeUf: "",
                            municipioIbgeId: "",
                        });
                        setActiveIndex(-1);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite o nome da cidade"
                    required
                    role="combobox"
                    type="text"
                    value={cidade}
                />

                {cidadeUf && (
                    <span aria-hidden="true" className="city-autocomplete__selected-uf">
                        — {cidadeUf}
                    </span>
                )}

                {showSuggestions && (
                    <div className="city-autocomplete__popover">
                        <ul
                            aria-label="Sugestões de cidades"
                            className="city-autocomplete__list"
                            id={listId}
                            role="listbox"
                        >
                            {suggestions.length > 0 ? (
                                suggestions.map((municipality, index) => (
                                    <li key={municipality.id} role="presentation">
                                        <button
                                            aria-selected={activeIndex === index}
                                            className="city-autocomplete__option"
                                            id={`${id}-option-${index}`}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => selectMunicipality(municipality)}
                                            role="option"
                                            tabIndex={-1}
                                            type="button"
                                        >
                                            {municipality.nome} <span>— {municipality.uf}</span>
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li role="presentation">
                                    <p className="city-autocomplete__empty" role="status">
                                        Nenhuma cidade encontrada.
                                    </p>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            <span className="city-autocomplete__help" id={helpId}>
                Selecione uma cidade da lista.
            </span>

            <span
                aria-live="polite"
                className="form-field__error"
                id={errorId}
            >
                {error}
            </span>
        </div>
    );
}

export default CidadeAutocomplete;
