/**
 * Created by sean on 02/02/17.
 */
import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Provider } from "react-redux";
import Nav from "./containers/nav";
import { routes, mainNav } from "./routes";
import ScrollToTop from "./ui/scroll";
import App from "./ui/index";
import { LoadingPage } from "./ui/loading";
import ErrorBoundary from "./ui/errors";
import Notifications from "./containers/notifications";

import { ThemeProvider } from "hav-shared-ui-components";

const logo = require("../assets/logo.png");

const Navigation = ({ ...props }) => <Nav navItems={mainNav} {...props} />;

const history = createBrowserHistory({
  basename: "/admin"
});

const HavAdmin = ({ store }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router history={history}>
          <App>
            <div className="hav-admin-main-menu">
              <nav>
                <img src={logo} alt="hav logo" className="main-menu-logo" />
                <Route component={Navigation} />
              </nav>
            </div>
            <div className="hav-admin-content">
              <Notifications />
              <ErrorBoundary>
                <Route component={ScrollToTop} />
                <React.Suspense fallback={<LoadingPage />}>
                  <Switch>
                    {routes.map((rc, index) => {
                      let { path, main, ...extra } = rc;
                      return (
                        <Route
                          key={index}
                          exact={true}
                          path={path}
                          component={main}
                          {...extra}
                        />
                      );
                    })}
                  </Switch>
                </React.Suspense>
              </ErrorBoundary>
            </div>
          </App>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default HavAdmin;

export { history };
