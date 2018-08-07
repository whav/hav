/**
 * Created by sean on 04/01/17.
 */
import React from "react";
import ReactDOM from "react-dom";

// AppContainer is a necessary wrapper component for HMR
import { AppContainer } from "react-hot-loader";
import configureStore from "./store";
import HavAdminApp from "./app";
import { PersistGate } from "redux-persist/es/integration/react";
import Loading from "./ui/loading";

require("./ui/bulma.sass");

const { store, persistor } = configureStore();

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <PersistGate persistor={persistor} loading={<Loading />}>
        <Component store={store} />
      </PersistGate>
    </AppContainer>,
    document.getElementById("root")
  );
};

render(HavAdminApp);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept("./app.js", () => render(HavAdminApp));
}
