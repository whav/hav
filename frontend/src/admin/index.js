/**
 * Created by sean on 04/01/17.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import Navigation from './nav'
import FileBrowser from './browser'
import LoadingIndicator from './ui/loading'

import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom'

require('./index.css');

const logo = require('../assets/logo.png')

const css = {
    app: 'hav-admin-app',
    logo: 'mw-100 pa2',
    menu: 'w-20 pa2 bg-yellow black h-100 hav-admin-menu',
    main: 'w-80 pl4 pt4 pb4 hav-admin-content'
}

const App = ({children}) => <div className={css.app}>{children}</div>

const Welcome = () => {
    return <div>
        <h1>Here be stuff</h1>
        <LoadingIndicator rotate={true} text="Me be loading!"/>
    </div>
}

ReactDOM.render(
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
                <Route exact path='/' component={Welcome} />
                <Route path="/incoming/" component={FileBrowser} />
            </Switch>
        </div>
    </App>
    </Router>,
    document.getElementById('root')
);
