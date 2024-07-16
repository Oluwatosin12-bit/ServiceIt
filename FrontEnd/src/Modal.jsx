import "./Modal.css";
function Modal({ isShown, onClose, children }) {
  if (isShown === false) {
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
