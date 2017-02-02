/**
 * Created by sean on 04/01/17.
 */
import React from 'react';
import ReactDOM from 'react-dom';

// AppContainer is a necessary wrapper component for HMR
import { AppContainer } from 'react-hot-loader';

import HavAdminApp from './app'

const render = (Component) => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        document.getElementById('root')
    );
}

render(HavAdminApp)


// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./app.js', () => {
    render(HavAdminApp)
  });
}







