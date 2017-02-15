/**
 * Created by sean on 08/02/17.
 */
/**
 * Created by sean on 04/01/17.
 */

import React from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'

const css = {
    navUl: 'list pl2 tl f3 f4-m lh-copy',
    subnavUl: 'list pr4 f5-m lh-copy br',
    liAll: 'link black truncate',
    liInactive: 'underline-hover',
    liActive: 'active underline'
}

const NavItem = (props) => {
    let {path, title, active} = props;
    let Icon = props.icon;
    let liClasses = classNames(
        css.liAll,
        active ? css.liActive : css.liInactive
    );

    return <Link to={path} className={liClasses}>
        <span>
            <Icon />
        </span>
        <span className="pl2 dn di-m di-l">
            {title}
        </span>
    </Link>;
}

class NavUI extends React.Component {

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
                    <NavItem path={rc.menuPath || rc.path} title={rc.title} icon={rc.icon} active={isActive}/>
                </li>
            })}
        </ul>
    }
}


export default NavUI