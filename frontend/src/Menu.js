/**
 * Created by sean on 05/09/16.
 */
import React, { Component } from 'react';

const MenuLink = (props) => {
    return <a href={props.target || '#'}>
        {props.name || 'Link'}
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