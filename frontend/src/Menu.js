/**
 * Created by sean on 05/09/16.
 */
import React, { Component } from 'react';

const MenuLink = ({target, name}) => {
    return <a href={target || '#'}>
        {name || 'Link'}
    </a>
}

class MainMenu extends Component {
    render() {
        return <ul>
            <li>
                <MenuLink name="Home"/>
            </li>
        </ul>
    }
}

export default MainMenu;