import React from "react";
import filesize from "filesize";
import { FallBackImageLoader } from "./index";
import Button from "../components/buttons";
import { Header, FileBrowserInterface } from "./index";

const ExifTable = ({ data = {} }) => {
  return (
    <table className="table is-striped">
      <thead>
        <tr>
          <th colSpan={2}>EXIF Data</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, value], index) => {
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

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
      <div className="content">
        <div className="columns">
          <div className="column">
            <FallBackImageLoader
              src={this.props.preview_url}
              srcSet={this.props.srcset}
              mime_type={this.props.mime_type}
              alt={this.props.name}
            />
          </div>
          <div className="column">
            <table className="table is-striped">
              {/* <thead>
                <tr>
                  <th colSpan={2}>Meta</th>
                </tr>
              </thead> */}
              <tbody>
                {Object.entries(tableProps).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {this.props.meta ? <ExifTable data={this.props.meta} /> : null}
      </div>
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
