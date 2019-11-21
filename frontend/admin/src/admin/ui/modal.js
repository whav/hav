import React from "react";
import classnames from "classnames";

const Modal = ({ onCancel, open = false, children = null }) => {
  return (
    <div className={classnames("modal", { "is-active": open })}>
      <div className="modal-background"></div>
      <div className="modal-content">{children}</div>
      <button className="modal-close is-large" onClick={onCancel}></button>
    </div>
  );
};

export default Modal;
