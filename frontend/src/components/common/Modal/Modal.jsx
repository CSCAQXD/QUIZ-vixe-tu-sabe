import { useEffect, useRef } from "react";
import "./Modal.css";

function Modal({
    children,
    className = "",
    isOpen,
    onClose,
    title,
}) {
    const closeButtonRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
        return undefined;
        }

        const previousFocus = document.activeElement;
        closeButtonRef.current?.focus();

        function handleKeyDown(event) {
        if (event.key === "Escape") {
            onClose();
        }
        if (event.key === "Tab") {
            const controls = contentRef.current?.querySelectorAll(
                'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
            );
            const first = controls?.[0];
            const last = controls?.[controls.length - 1];
            if (!first) return;
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
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
        if (previousFocus?.isConnected && !previousFocus.disabled) {
            previousFocus.focus();
        }
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

        <section className={`modal__content ${className}`.trim()} ref={contentRef}>
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
