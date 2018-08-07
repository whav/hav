import React from "react";
import { IconContext } from "react-icons";

// css, images and stuff
require("./index.css");

const App = ({ children }) => (
  <IconContext.Provider value={{ className: "react-icon" }}>
    <div className="hav-admin-app">{children}</div>
  </IconContext.Provider>
);

export default App;
