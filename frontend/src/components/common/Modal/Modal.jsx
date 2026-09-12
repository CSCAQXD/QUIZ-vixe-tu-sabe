import { useEffect, useRef } from "react";
import "./Modal.css";

function Modal({
    children,
    isOpen,
    onClose,
    title,
}) {
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
        return undefined;
        }

        closeButtonRef.current?.focus();

        function handleKeyDown(event) {
        if (event.key === "Escape") {
            onClose();
        }
        }

        document.addEventListener(
        "keydown",
        handleKeyDown,
        );

        return () => {
        document.removeEventListener(
            "keydown",
            handleKeyDown,
        );
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
        aria-labelledby="modal-title"
        aria-modal="true"
        className="modal"
        role="dialog"
        >
        <button
            aria-label="Fechar janela"
            className="modal__backdrop"
            onClick={onClose}
            type="button"
        />

        <section className="modal__content">
            <button
            aria-label="Fechar"
            className="modal__close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
            >
            ×
            </button>

            <h2 id="modal-title">{title}</h2>
            {children}
        </section>
        </div>
    );
}

export default Modal;