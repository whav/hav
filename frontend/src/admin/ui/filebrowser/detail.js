import React from "react";
import filesize from "filesize";
import { FallBackImageLoader } from "./index";
import Button from "../components/buttons";

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

export default class extends React.Component {
  render() {
    const props = this.props;
    const tableProps = {
      Size: filesize(this.props.size),
      "Mime Type": this.props.mime,
      Ingestable: this.props.ingestable ? "Yes" : "No"
    };

    return (
      <div className="container">
        <div className="columns">
          <div className="column">
            <h1 className="title">{this.props.name}</h1>

            <h2>Properties</h2>

            <table className="table is-striped">
              <thead>
                <tr>
                  <th colSpan={2}>Meta</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tableProps).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="field is-grouped">
              <Button onClick={props.ingest} className="is-primary">
                Ingest
              </Button>
            </div>

            {this.props.meta ? <ExifTable data={this.props.meta} /> : null}
          </div>
          <div className="column is-one-third">
            <FallBackImageLoader
              src={this.props.preview_url}
              sources={this.props.srcset}
              mime_type={props.mime_type}
              alt={props.name}
            />
          </div>
        </div>
      </div>
    );
  }
}
