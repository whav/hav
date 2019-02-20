import React from "react";

import { Audio, Video, Image } from "../../components/webassets";

const WebAsset = ({ assets = [], archive_mime_type = "image" }) => {
  archive_mime_type = archive_mime_type.split("/")[0];
  let primary_asset = assets.find(a =>
    a.mime_type.startsWith(archive_mime_type)
  );
  // secondary asset should always be an image
  let secondary_asset = assets.find(a => a.mime_type.startsWith("image")) || {
    url: ""
  };
  const wa = primary_asset || secondary_asset;
  switch (wa.mime_type.split("/")[0].toLowerCase()) {
    case "audio":
      return <Audio {...wa} poster={secondary_asset.url} />;
    case "image":
      return <Image {...wa} />;
    case "video":
      return <Video {...wa} poster={secondary_asset.url} />;
    default:
      return <div>Unknown media type: {wa.mime_type}</div>;
  }
};

const TableRow = ({ name, value }) => {
  return (
    <tr>
      <td>{name}</td>
      <td>{value}</td>
    </tr>
  );
};

const ArchiveFileDetails = props => {
  const keys = [
    "original_filename",
    "size",
    "hash",
    "archived_at",
    "archived_by"
  ];
  return (
    <table className="table">
      <tbody>
        {keys.map(k => (
          <TableRow key={k} name={k} value={props[k]} />
        ))}
      </tbody>
    </table>
  );
};

class HavMediaDetail extends React.Component {
  render() {
    const { details } = this.props;
    const { webassets = [], archive_files = [], mime_type } = details;
    return (
      <div className="content">
        <h1>#{details.name}</h1>
        {webassets.length > 0 ? (
          <WebAsset assets={webassets} archive_mime_type={mime_type} />
        ) : (
          <div>No webassets available...</div>
        )}

        {archive_files.map((af, index) => (
          <ArchiveFileDetails key={index} {...af} />
        ))}
      </div>
    );
  }
}

export default HavMediaDetail;
