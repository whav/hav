/**
 * Created by sean on 08/02/17.
 */
/**
 * Created by sean on 04/01/17.
 */

import React from 'react'
import {NavLink} from 'react-router-dom'
import classNames from 'classnames'
// import { matchPath } from 'react-router-dom'

const css = {
    navUl: 'list pl2 tl f3 f4-m lh-copy',
    subnavUl: 'list pr4 f5-m lh-copy br',
    liAll: 'link black truncate',
    liInactive: 'underline-hover',
    liActive: 'active underline'
}

const NavItem = (props) => {
    let {link, title, icon, menuExact=true} = props;

    let Icon = icon;
    let liClasses = classNames(
        css.liAll
    );

    return <NavLink to={link}
                    exact={menuExact}
                    activeClassName={css.liActive}
                    className={liClasses}>
        <span>
            <Icon />
        </span>
        <span className="pl2 dn di-m di-l">
            {title}
        </span>
    </NavLink>;
}

class NavUI extends React.Component {

    render() {
        let {navItems} = this.props;
        return <ul className={css.navUl}>
            {navItems.map((menuConfig, index) => {
                return <li key={index}>
                    <NavItem {...menuConfig} />
                </li>
            })}
        </ul>
    }
}


export default NavUI
