import React from "react";
import { ErrorMessage as FormikErrorMessage } from "formik";

import classnames from "classnames";

const FieldWrapper = ({ label = "", children }) => {
  return (
    <div className="field">
      {label ? <label className="label">{label}</label> : null}
      <div className={classnames("control")}>{children}</div>
    </div>
  );
};

const ErrorMessage = props => (
  <FormikErrorMessage
    {...props}
    render={msg => {
      return <p className="help is-danger">{msg}</p>;
    }}
  />
);

export { FieldWrapper, ErrorMessage };
