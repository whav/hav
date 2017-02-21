/**
 * Created by sean on 02/02/17.
 */
import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom'

import { Provider } from 'react-redux';

import Nav from './nav'
import {routes, mainNav} from './routes'

// css, images and stuff
require('./ui/index.css');

const logo = require('../assets/logo.png')
const css = {
    logo: 'mw-100 pa2',
    menu: 'w-20 pa2 bg-yellow black h-100 hav-admin-menu',
    main: 'w-80 pa3 hav-admin-content',
    app: 'hav-admin-app'
}

const App = ({children}) => <div className={css.app}>{children}</div>
const Navigation = ({...props}) => <Nav navItems={mainNav} {...props} />

const HavAdmin = ({store}) => {
    return (
    <Provider store={store}>
        <Router basename="/admin">
        <App>
            <div className={css.menu}>
                <img src={logo} alt="hav logo" className={css.logo} />
                <nav>
                    <Route component={Navigation} />
                </nav>
            </div>
            <div className={css.main}>
                <Switch>
                {
                    routes.map(
                        (rc, index) => {
                            let {path, main, ...extra} = rc;
                            return <Route key={index} exact={true} path={path} component={main} {...extra} />
                        }
                    )
                }
                </Switch>
            </div>
        </App>
        </Router>
    </Provider>);
};

export default HavAdmin


