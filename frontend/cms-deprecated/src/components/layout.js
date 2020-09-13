import React from 'react';
import PropTypes from 'prop-types';
import { StaticQuery, graphql } from 'gatsby';
import cn from 'classnames';

import Nav from './nav';
import '../css/main.css';

const Layout = ({
  children,
  contentClass = '',
  active_collection,
  collection,
}) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <div className="two-column-layout">
        <div className="main">
          <main className={cn(contentClass)}>{children}</main>
          <footer>© {new Date().getFullYear()}</footer>
        </div>
        <div className="navigation">
          <Nav
            active_collection={active_collection}
            collection={collection || {}}
          />
        </div>
      </div>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
