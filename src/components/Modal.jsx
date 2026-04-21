export default function Modal({ show, success, title, message, buttonText, onClose }) {
  if (!show) return null;

  const variantClass = success ? 'synth-feedback-modal--success' : 'synth-feedback-modal--error';

  return (
    <>
      <div
        className="modal fade show d-block synth-feedback-modal"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog synth-feedback-modal__dialog" role="document">
          <div className={`modal-content synth-feedback-modal__content ${variantClass}`}>
            <div className="modal-header synth-feedback-modal__header">
              <h5 className="modal-title synth-feedback-modal__title">{title}</h5>
              <button
                type="button"
                className="btn-close synth-feedback-modal__close"
                aria-label="Fechar"
                onClick={onClose}
              />
            </div>
            <div className="modal-body synth-feedback-modal__body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer synth-feedback-modal__footer">
              <button type="button" className="btn synth-feedback-modal__button" onClick={onClose}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show synth-feedback-modal__backdrop" />
    </>
  );
}
