import React from "react";

import { ThemeProvider } from "theme-ui";
import theme from "./theme";

export default ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <style>{`html,body { margin: 0; }`}</style>
        {children}
      </React.Fragment>
    </ThemeProvider>
  );
};
