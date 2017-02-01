/**
 * Created by sean on 04/01/17.
 */

import React from 'react'
import {Link} from 'react-router-dom'

const css = {
    navUl: 'list pr2 tr'
}


const NavItem = ({name, to, active}) => {
    return <Link to={to}>{name}</Link>;
}

class Nav extends React.Component {
    render() {
        let {match} = this.props;
        return <ul className={css.navUl}>
            <li>
                <NavItem name="Home" to='/' active={match.active}/>
            </li>
            <li>
                <NavItem name="Incoming" to='/incoming/' active={match.active}/>
            </li>
        </ul>
    }
}

export default Nav