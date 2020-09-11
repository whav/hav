import React from "react";

const Image = ({ media, caption, title, url }) => {
  return (
    <figure>
      <img
        alt={media.title}
        src={media.thumbnailUrl}
        srcSet={media.srcset.join(", ")}
      />
      <figcaption>
        {caption || <Link to={url}>{title || media.title}</Link>}
      </figcaption>
    </figure>
  );
};

const MediaSwitch = (props) => {
  // const { media } = props;
  return <Image {...props} />;
};

class Media extends React.Component {
  render() {
    const { id, title } = this.props;
    const url = `/collections/${data.media.collection.slug}/browse/media/${id}/`;
  }
}

export default Media;
