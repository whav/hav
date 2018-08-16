import React from "react";

import { Audio, Video, Image } from "../../components/webassets";

const WebAsset = props => {
  switch (props.mime_type.split("/")[0].toLowerCase()) {
    case "audio":
      return <Audio {...props} />;
    case "image":
      return <Image {...props} />;
    case "video":
      return <Video {...props} />;
    default:
      return <pre>{JSON.stringify(props, null, 2)}</pre>;
  }
};

const TableRow = ({ name, value }) => {
  console.log(name, value);
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
    const { webassets = [], archive_files = [] } = details;
    return (
      <div className="content">
        <h1>#{details.name}</h1>

        {webassets.map((wa, index) => (
          <WebAsset key={index} {...wa} />
        ))}

        {archive_files.map((af, index) => (
          <ArchiveFileDetails key={index} {...af} />
        ))}
      </div>
    );
  }
}

export default HavMediaDetail;
