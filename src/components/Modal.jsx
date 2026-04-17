export default function Modal({ show, success, title, message, buttonText, onClose }) {
  if (!show) return null;

  const titleClass = success ? 'text-success' : 'text-danger';
  const buttonClass = success ? 'btn btn-success' : 'btn btn-danger';

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className={`modal-title ${titleClass}`}>{title}</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className={buttonClass} onClick={onClose}>
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
