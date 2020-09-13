import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import './mediaDetail.css';

const QUERY = gql`
  query($mediaID: String!) {
    media(id: $mediaID) {
      ancestors {
        name
        id
      }
      srcset
      thumbnailUrl
      creators {
        name
        id
      }
      createdAt
      creationTimeframe
      tags {
        name
        source {
          source
          sourceRef
        }
      }
      license {
        name
        shortName
      }
      title
      description
    }
  }
`;

class MediaDetail extends React.Component {
  render() {
    const { title, description, srcset } = this.props;
    return (
      <div className="media-detail">
        <h1>{title}</h1>
        <p>{description}</p>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>

        <p>
          <img srcSet={srcset.join(',\n ')} alt={title} />
        </p>
      </div>
    );
  }
}

export default ({ mediaID }) => {
  return (
    <Query query={QUERY} variables={{ mediaID }}>
      {({ loading, error, data }) => {
        if (error) {
          return <span>Error!</span>;
        } else {
          if (loading) {
            return null;
          }

          return <MediaDetail {...data.media} />;
        }
      }}
    </Query>
  );
};
