/**
 * Created by sean on 08/02/17.
 */
import React from 'react'
import {NavLink} from 'react-router-dom'
import classNames from 'classnames'


const NavItem = (props) => {
    let {link, title, icon, menuExact=true} = props;
    let Icon = icon ? icon : null;

    let inner = (<span>
        <Icon />
        {title}
    </span>);

    if (link) {
        return <NavLink to={link} exact={menuExact}>
            {inner}
        </NavLink>
    }
    return inner;
}

class NavUI extends React.Component {

    render() {
        let {navItems} = this.props;
        return <ul>
            {navItems.map((menuConfig, index) => {
                let subItems = menuConfig.sub || [];
                let subNav = null;
                if (subItems.length) {
                    subNav = <NavUI navItems={subItems} />
                }
                return <li key={index}>
                    <NavItem {...menuConfig} />
                    {subNav}
                </li>
            })}
        </ul>
    }
}


export default NavUI
