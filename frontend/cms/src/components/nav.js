import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { Link as GBLink } from 'gatsby';

import havLogo from '../assets/logos/hav.svg';
import univieLogo from '../assets/logos/univie.svg';
import cirdisLogo from '../assets/logos/cirdis.svg';

import './nav.css';

const isPartiallyActive = ({ isPartiallyCurrent }) => {
  return isPartiallyCurrent ? { className: 'active' } : null;
};

const Logo = ({ src, alt = 'logo', ...props }) => (
  <img className="logo" src={src} alt={alt} {...props} />
);

const Link = props => <GBLink {...props} activeClassName="active" />;

class CollectionDetailMenu extends React.Component {
  render() {
    let { collection, pages, collection_base_url } = this.props;

    // grab index page and filter it out
    const index_page = pages.find(p => p.fields.slug === collection_base_url);
    // remove the index page from the page list
    pages = pages.filter(p => p !== index_page);
    pages = pages
      .map(p => ({ ...p, _ordering: parseInt(p.fields.ordering, 10) }))
      .filter(p => !isNaN(p._ordering))
      .sort((a, b) => a._ordering - b._ordering);

    return (
      <React.Fragment>
        <li className="nav-small" key="back-home">
          <Link to="/">&larr; All collections</Link>
        </li>
        <li key="collection-pages">
          <Link to={collection_base_url}>{collection.name}</Link>
          <ul>
            {pages.map(p => {
              return (
                <li key={p.fields.slug}>
                  <Link to={p.fields.slug}>{p.frontmatter.title}</Link>
                </li>
              );
            })}
          </ul>
        </li>
        {collection.browseable && (
          <li key={`browse-${collection.slug}`}>
            <Link
              to={`${collection_base_url}browse/`}
              getProps={isPartiallyActive}
            >
              Browse
            </Link>
          </li>
        )}
        {collection.searchable && (
          <li key={`search-${collection.slug}`}>
            <Link to={`${collection_base_url}search/`}>Search</Link>
          </li>
        )}
      </React.Fragment>
    );
  }
}

class CollectionMainMenu extends React.Component {
  render() {
    let havCollections = this.props.collections;
    return (
      <>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          Collections
          <ul>
            {havCollections.map(collection => (
              <li key={collection.slug}>
                <Link to={`/collections/${collection.slug}/`}>
                  {collection.shortName || collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </>
    );
  }
}

class MainMenu extends React.Component {
  render() {
    const { active_collection } = this.props;
    const hav_collections = this.props.hav.collections;
    const collectionPages = this.props.collectionPages.edges.map(e => e.node);

    let subMenu = null;

    if (active_collection) {
      const collection = hav_collections.find(
        c => c.slug === active_collection
      );
      subMenu = (
        <CollectionDetailMenu
          collection={collection}
          collection_base_url={`/collections/${collection.slug}/`}
          pages={collectionPages.filter(
            cp => cp.fields.collection_slug === active_collection
          )}
        />
      );
    } else {
      subMenu = <CollectionMainMenu collections={this.props.hav.collections} />;
    }
    return (
      <nav>
        <div className="nav-top">
          <Link to="/">
            <Logo src={havLogo} alt="hav logo" />
          </Link>
          <ul>{subMenu}</ul>
        </div>
        <div className="nav-bottom">
          <Logo src={cirdisLogo} />
          <Logo src={univieLogo} />
          <Link to="/imprint/">Imprint</Link>
          <Link to="/open-knowledge/">License Models</Link>
          <Link to="/cooperation/">How to cooperate</Link>
        </div>
      </nav>
    );
  }
}

const Nav = props => (
  <StaticQuery
    query={graphql`
      query NavigationQuery {
        hav {
          collections {
            name
            shortName
            slug
            browseable
            searchable
          }
        }
        collectionPages: allMdx(
          filter: { fields: { sourceName: { eq: "collections" } } }
        ) {
          edges {
            node {
              fields {
                ordering
                collection_slug
                slug
              }
              frontmatter {
                title
                date
              }
              parent {
                ... on File {
                  base
                  name
                }
              }
            }
          }
        }
      }
    `}
    render={data => <MainMenu {...data} {...props} />}
  />
);

export default Nav;
