import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false,
  showConfirm = true
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className={`modal-icon ${type}`}>
              {type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : type === 'confirm' ? '?' : 'ℹ'}
            </span>
            <h3>{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          {showCancel && (
            <button className="modal-btn secondary" onClick={onClose}>
              {cancelText}
            </button>
          )}
          {showConfirm && (
            <button 
              className={`modal-btn primary ${type === 'danger' ? 'danger' : ''}`} 
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
