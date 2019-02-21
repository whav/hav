import React from "react";
import "./ingest.css";

import { TransitionGroup, CSSTransition } from "react-transition-group"; // ES6

const FormSet = ({ children }) => {
  return (
    <TransitionGroup>
      {children.map((c, i) => (
        <CSSTransition
          classNames="ingest-form"
          timeout={{ enter: 500, exit: 300 }}
          key={i}
        >
          {c}
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

export default FormSet;
