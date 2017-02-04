/**
 * Created by sean on 02/02/17.
 */
import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom'


import Nav from './nav'
import routes from './routes'

// css, images and stuff
require('./ui/index.css');
const logo = require('../assets/logo.png')
const css = {
    logo: 'mw-100 pa2',
    menu: 'w-20 pa2 bg-yellow black h-100 hav-admin-menu',
    main: 'w-80 pl4 pt4 pb4 hav-admin-content',
    app: 'hav-admin-app'
}

const App = ({children}) => <div className={css.app}>{children}</div>
const Navigation = (props) => <Nav routes={routes} {...props} />;

const HavAdmin = () => {
    return (
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
                {routes.map((rc, index) => <Route key={index} exact={true} path={rc.path} component={rc.main} />)}
                </Switch>
            </div>
        </App>
    </Router>);
};

export default HavAdmin


