/**
 * Created by sean on 08/02/17.
 */
import React from "react";
import { NavLink as RRNavLink } from "react-router-dom";
import classNames from "classnames";

const NavLink = props => <RRNavLink activeClassName="is-active" {...props} />;

const NavItem = props => {
  let { link, title, icon = null, menuExact = true } = props;
  let Icon = icon;

  let inner = (
    <span>
      {icon ? <Icon /> : null} {title}
    </span>
  );

  if (link) {
    return (
      <NavLink to={link} exact={menuExact}>
        {inner}
      </NavLink>
    );
  } else {
    return inner;
  }
};

const NavMenu = ({ items = [] }) => {
  return (
    <ul className="menu-list">
      {items.map(c => (
        <li key={c.title}>
          <NavItem {...c} />
        </li>
      ))}
    </ul>
  );
};

const NavMenuWithLabel = ({ items = [], ...props }) => {
  return [
    <p key="menu-label" className="menu-label">
      {props.title}
    </p>,
    <NavMenu key="menu-items" items={items} />
  ];
};

class NavUI extends React.Component {
  render() {
    let { navItems } = this.props;
    let items = [];
    navItems.forEach((menuConfig, index) => {
      const isLink = Boolean(menuConfig.href);
      const subItems = menuConfig.sub || [];
      const hasSubItems = subItems.length;
      const key = menuConfig.title;

      const menu = hasSubItems ? (
        <NavMenuWithLabel key={key} items={subItems} {...menuConfig} />
      ) : (
        <NavMenu key={key} items={[menuConfig]} />
      );
      items = [...items, menu];
    });
    return <div className="menu">{items}</div>;
  }
}

export default NavUI;
