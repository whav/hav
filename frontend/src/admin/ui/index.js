import React from "react";
import { IconContext } from "react-icons";

// import css
require("./index.css");
require("./bulma.sass");

const App = ({ children }) => (
  <IconContext.Provider value={{ className: "react-icon" }}>
    <div className="hav-admin-app">{children}</div>
  </IconContext.Provider>
);

export default App;
