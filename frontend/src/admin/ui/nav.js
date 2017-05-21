/**
 * Created by sean on 08/02/17.
 */
import React from 'react'
import {NavLink} from 'react-router-dom'
import classNames from 'classnames'
import {Menu} from 'semantic-ui-react'

const MenuLink = (props) => {
    return <Menu.Item as={NavLink} {...props} />
}

const NonNavMenuItem = (props) => {
    return <Menu.Item {...props} />
}

const NavItem = (props) => {
    let {link, title, icon=null, menuExact=true} = props;
    let Icon = icon;

    let inner = (<span>
        {icon ? <Icon /> : null}
        {' '}
        {title}
    </span>);

    if (link) {
        return <MenuLink to={link} exact={menuExact}>
            {inner}
        </MenuLink>
    } else {
        return <NonNavMenuItem>
            {inner}
        </NonNavMenuItem>
    }
}


class NavUI extends React.Component {

    render() {
        let {navItems} = this.props;
        let items = [];
        navItems.forEach((menuConfig, index) => {

            items = [
                ...items,
                <NavItem {...menuConfig} key={items.length} />
            ]
            let subItems = menuConfig.sub || [];  
            let hasSubMenu = subItems.length;
            if (hasSubMenu) {
                items = [
                    ...items,
                    <Menu.Menu key={items.length}>
                        {subItems.map((i, index) => <NavItem key={index} {...i} />)}
                    </Menu.Menu> 
                ]
            }
        })

        return <Menu secondary vertical>
            {items}
        </Menu>
    }
}


export default NavUI
