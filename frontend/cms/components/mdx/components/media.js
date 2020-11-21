/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";

import { useAPI } from "hooks";
import { Image, Card, Text } from "theme-ui";
import { Loading } from "components";

const ImageMedia = ({ media, caption, title, url }) => {
  return (
    <Image
      alt={media.title}
      src={media.thumbnailUrl}
      srcSet={media.srcset.join(", ")}
    />
  );
};

const MediaSwitch = (props) => {
  return <ImageMedia {...props} />;
};

const Media = (props) => {
  const { id, caption } = props;
  const { data } = useAPI("/api/media/", { mediaId: id });
  if (!data) {
    return null;
  }

  return (
    <Card
      sx={{
        maxWidth: "50%",
        padding: "1rem",
        marginTop: "1rem",
      }}
    >
      <MediaSwitch {...data} />
      {caption && <Text>{caption}</Text>}
    </Card>
  );
};

export default Media;
