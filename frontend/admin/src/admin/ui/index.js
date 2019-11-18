import React from "react";
import { IconContext } from "react-icons";

// import css
require("./index.css");
require("./bulma.sass");

class ScrollToTop extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return this.props.children;
  }
}

const App = ({ children }) => (
  <IconContext.Provider value={{ className: "react-icon" }}>
    <div className="hav-admin-app">{children}</div>
  </IconContext.Provider>
);

export default App;
