import React from "react";
import classnames from "classnames";

const Modal = ({ children, open = false, close, modalStyle = {} }) => {
  return (
    <div className={classnames("modal", { "is-active": open })}>
      <div className="modal-background" onClick={close} />
      <div className="modal-content" style={modalStyle}>
        {children}
      </div>
      <button
        className="modal-close is-large"
        onClick={close}
        aria-label="close"
      />
    </div>
  );
};

const largeModalStyle = { width: "90vw" };
const LargeModal = props => <Modal modalStyle={largeModalStyle} {...props} />;

export default Modal;

export { LargeModal };
