import React from 'react';
import Layout from '../components/layout';
import MediaDetail from './mediaDetail';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Router, Link } from '@reach/router';
import { FolderIcon, FileIcon } from '../components/icons';

import './browse.css';

const FallbackImage = () => <FileIcon />;

const Breadcrumbs = ({ ancestors = [] }) => {
  return (
    <ul className="breadcrumbs">
      {ancestors.map(a => {
        return (
          <li key={a.id}>
            <Link to={a.url}>{a.name}</Link>
          </li>
        );
      })}
    </ul>
  );
};

const MediaEntry = ({ preview = null, title = null }) => {
  return (
    <div className="gallery-media">
      <div className="gallery-media-preview">{preview}</div>
      <div className="gallery-media-title">{title}</div>
    </div>
  );
};

const BrowseGallery = ({
  folders = [],
  mediaEntries = [],
  ancestors = [],
  currentNode,
  buildURL,
  ...props
}) => {
  return (
    <>
      <h1>{currentNode.name}</h1>
      <Breadcrumbs
        ancestors={ancestors.map(a => ({
          ...a,
          url: buildURL(`${a.id}/`),
        }))}
      />
      <div className="gallery-grid">
        {folders.map(f => {
          return (
            <Link to={buildURL(`${f.id}/`)} key={f.id}>
              <MediaEntry preview={<FolderIcon />} title={f.name} />
            </Link>
          );
        })}
        {mediaEntries.map(media => {
          return (
            <Link
              to={buildURL(`/media/${media.id}/`)}
              key={`media-${media.id}`}
            >
              <MediaEntry
                preview={
                  media.thumbnailUrl ? (
                    <img
                      src={media.thumbnailUrl || SVGRect}
                      alt={media.title}
                    />
                  ) : (
                    <FallbackImage />
                  )
                }
                title={media.title}
              />
            </Link>
          );
        })}
        {/* just a fallback */}
        {mediaEntries.length + folders.length === 0 ? (
          <span>This folder is empty...</span>
        ) : null}
      </div>
    </>
  );
};

const QUERY = gql`
  query NodeBrowserQuery($nodeID: String!, $collectionSlug: String!) {
    node(nodeID: $nodeID, collectionSlug: $collectionSlug) {
      name
      id
      ancestors {
        name
        id
      }
      children {
        name
        id
      }
    }
    mediaEntries(nodeID: $nodeID) {
      id
      title
      thumbnailUrl
    }
  }
`;

class BrowseCollectionPage extends React.Component {
  render() {
    const { nodeID, collectionSlug } = this.props;
    return (
      <Layout active_collection={collectionSlug} {...this.props}>
        <Query
          query={QUERY}
          variables={{
            nodeID,
            collectionSlug,
          }}
        >
          {({ loading, error, data }) => {
            if (error) {
              return <span>Error!</span>;
            } else {
              if (loading) {
                return null;
              }

              return (
                <>
                  <BrowseGallery
                    currentNode={data.node}
                    folders={data.node.children}
                    mediaEntries={data.mediaEntries}
                    ancestors={data.node.ancestors}
                    {...this.props}
                  />
                </>
              );
            }
          }}
        </Query>
      </Layout>
    );
  }
}

const MediaDetailPage = ({ collectionSlug, mediaID, ...props }) => {
  return (
    <Layout active_collection={collectionSlug}>
      <MediaDetail mediaID={mediaID} />
    </Layout>
  );
};

class Browser extends React.Component {
  render() {
    const { collection, baseURL } = this.props.pageContext;

    const buildURL = path => {
      if (path.startsWith('/')) {
        path = path.slice(1);
      }
      return `${baseURL}${path}`;
    };
    const props = {
      buildURL,
      collectionSlug: collection.slug,
    };
    return (
      <Router basepath={baseURL}>
        <BrowseCollectionPage path=":nodeID/" {...props} />
        <MediaDetailPage path="media/:mediaID/" {...props} />
        <BrowseCollectionPage
          path="/"
          nodeID={String(collection.rootNode.id)}
          {...props}
        />
      </Router>
    );
  }
}

export default Browser;
