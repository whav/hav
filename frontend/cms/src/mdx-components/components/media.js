import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Link } from '@reach/router';

const Image = ({ media, caption, title, url }) => {
  return (
    <figure>
      <img
        alt={media.title}
        src={media.thumbnailUrl}
        srcSet={media.srcset.join(', ')}
      />
      <figcaption>
        {caption || <Link to={url}>{title || media.title}</Link>}
      </figcaption>
    </figure>
  );
};

const MediaSwitch = props => {
  // const { media } = props;
  return <Image {...props} />;
};

const QUERY = gql`
  query MediaQuery($id: String!) {
    media(id: $id) {
      id
      title
      type
      thumbnailUrl
      srcset
      collection {
        name
        slug
        id
      }
    }
  }
`;

class Media extends React.Component {
  render() {
    const { id, title } = this.props;
    return (
      <Query query={QUERY} variables={{ id: String(id) }}>
        {({ loading, error, data }) => {
          if (error) {
            return <span>Error!</span>;
          } else {
            if (loading) {
              return null;
            }
            console.log(data);
            const url = `/collections/${data.media.collection.slug}/browse/media/${id}/`;
            return <MediaSwitch media={data.media} title={title} url={url} />;
          }
        }}
      </Query>
    );
  }
}

export default Media;
