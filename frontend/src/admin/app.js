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
import ErrorBoundary from "./ui/errors";

const logo = require("../assets/logo.png");

const Navigation = ({ ...props }) => <Nav navItems={mainNav} {...props} />;

const history = createBrowserHistory({
  basename: "/admin"
});

const HavAdmin = ({ store }) => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <App>
          <div className="hav-admin-main-menu">
            <nav>
              <img src={logo} alt="hav logo" className="main-menu-logo" />
              <Route component={Navigation} />
            </nav>
          </div>
          <div className="hav-admin-content">
            <ErrorBoundary>
              <Route component={ScrollToTop} />
              <React.Suspense fallback={<div>Loading...</div>}>
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
    </Provider>
  );
};

export default HavAdmin;

export { history };
