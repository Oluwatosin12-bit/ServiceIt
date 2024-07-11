import "./Modal.css";
function Modal({ show, onClose, children }) {
  if (!show) {
    return null;
  }
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalContent"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modalClose" onClick={onClose}>
          &times;
        </button>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
export default Modal;
