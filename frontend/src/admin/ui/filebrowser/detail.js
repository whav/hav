import React from "react";
import filesize from "filesize";
import { FallBackImageLoader } from "./index";
import Button from "../components/buttons";
import { Header, FileBrowserInterface } from "./index";
import { MdRecentActors } from "react-icons/md";

const ExifTable = ({ data = {} }) => {
  return (
    <React.Fragment>
      <tr>
        <th colSpan={2}>EXIF Data</th>
      </tr>
      {Object.entries(data).map(([key, value], index) => {
        return (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        );
      })}
    </React.Fragment>
  );
};

const Table = ({ rows = [] }) => (
  <div className="table-container">
    <table className="table is-striped is-bordered is-narrow is-hoverable">
      <tbody>
        {rows.map((row_items, index) => (
          <tr key="index">
            {row_items.map((r, i) => (
              <td key={i}>{r}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

class MediaDetail extends React.Component {
  render() {
    const tableProps = {
      Size: filesize(this.props.size),
      "Mime Type": this.props.mime
      // Ingestable: this.props.ingestable ? "Yes" : "No"
    };

    const aside = this.props.ingestable ? (
      <Button onClick={this.props.ingest} className="is-primary">
        Ingest
      </Button>
    ) : null;

    const main = (
      <React.Fragment>
        <div className="columns">
          <div className="column is-two-thirds">
            <div className="detail-preview">
              <FallBackImageLoader
                src={this.props.preview_url}
                srcSet={this.props.srcset}
                mime_type={this.props.mime_type}
                alt={this.props.name}
              />
            </div>
          </div>
        </div>
        {/* <div style={{ height: "5em", border: "2px solid black" }} /> */}
        <h3>File Information</h3>
        <Table rows={Object.entries(tableProps)} />
        {this.props.meta ? (
          <React.Fragment>
            <h3>EXIF Data</h3>

            <Table rows={Object.entries(this.props.meta)} />
          </React.Fragment>
        ) : null}
        {/* {this.props.meta ? <ExifTable data={this.props.meta} /> : null} */}
      </React.Fragment>
    );

    return (
      <FileBrowserInterface
        main={main}
        header={<Header title={this.props.name} aside={aside} />}
      />
    );
  }
}

export default MediaDetail;
