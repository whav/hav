import React from "react";

const Modal = ({ onClose, open = false, children = null }) => {
  return open ? (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-content">{children}</div>
      <button className="modal-close is-large" onClick={onClose}></button>
    </div>
  ) : null;
};

export default Modal;
