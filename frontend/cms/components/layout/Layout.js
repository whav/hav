import React from "react";

import Head from "./Head";
import NavBar from "../navigation/NavBar";

const Layout = ({ children, nav, header }) => {
  return (
    <>
      <Head />

      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="flex-none md:w-44 md:min-h-screen lg:w-64 bg-yellow-400">
          <NavBar />
        </div>
        <div className="flex-grow p-4  min-h-screen">{children}</div>;
      </div>
    </>
  );
};

export default Layout;
