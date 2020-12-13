import React from "react";

const Wrapper = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-stretch md:h-screen md:w-screen">
      {children}
    </div>
  );
};

const Nav = ({ children }) => {
  return (
    <div className="flex-initial bg-yellow-400 p-4 md:w-1/5">{children}</div>
  );
};

const Main = ({ children }) => {
  return (
    <div className="flex-grow p-4 md:overflow-y-scroll md:overflow-x-hidden min-h-screen">
      {children}
    </div>
  );
};

export default { Wrapper, Nav, Main };
