/**
 * Created by sean on 04/01/17.
 */

import React from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'


const css = {
    navUl: 'list pr2 tr',
    liAll: 'link black',
    liInactive: 'underline-hover',
    liActive: 'active underline'
}

const NavItem = (props) => {
    let {path, title, active} = props;
    let liClasses = classNames(
        css.liAll,
        active ? css.liActive : css.liInactive
    );

    return <Link to={path} className={liClasses}>
        {title}
    </Link>;
}

class Nav extends React.Component {

    constructor(props) {
        super(props)
        this.isActive = this.isActive.bind(this)
    }

    isActive(route) {
        let {match} = this.props;
        if (route.menuExact) {
            return match.url === route.path;
        } else {
            return (match.url !== '/') && match.url.startsWith(route.menuPath);
        }
        return false
    }

    render() {
        let {match, routes} = this.props;
        return <ul className={css.navUl}>
            {routes.map((rc, index) => {
                let isActive = match && this.isActive(rc);
                return <li key={index}>
                    <NavItem path={rc.menuPath || rc.path} title={rc.title} active={isActive}/>
                </li>
            })}
        </ul>
    }
}

export default Nav