import React from "react";

const Wrapper = ({ children }) => {
    console.log('Wrapper?', children);
  return <div className="prose">{children}</div>;
};

export default Wrapper;
