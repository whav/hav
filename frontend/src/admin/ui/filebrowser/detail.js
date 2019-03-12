import React from "react";
import filesize from "filesize";
import { FallBackImageLoader } from "./index";
import Button from "../components/buttons";
import { Header, FileBrowserInterface } from "./index";
import { buildFrontendUrl } from "../../api/urls";
import { Link } from "react-router-dom";

const Title = ({ children }) => <h3 className="title is-4">{children}</h3>;

const RelatedFiles = ({ files }) => {
  return (
    <React.Fragment>
      <Title>Possibly related files</Title>
      {files.map(f => {
        const rows = {
          name: <Link to={buildFrontendUrl(f.url)}>{f.name}</Link>,
          size: filesize(f.size),
          mime: f.mime
        };
        return (
          <div key={f.url} className="columns">
            <div className="column">
              <FallBackImageLoader
                src={f.preview_url}
                srcSet={f.srcset}
                mime_type={f.mime}
                alt={f.name}
              />
            </div>
            <div className="column is-two-thirds">
              <Table key={f.url} rows={Object.entries(rows)} />
            </div>
          </div>
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
          <tr key={index}>
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
    const { related_files = [], url } = this.props;
    const tableProps = {
      Size: filesize(this.props.size),
      "Mime Type": this.props.mime
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
                mime_type={this.props.mime}
                alt={this.props.name}
              />
            </div>
          </div>
        </div>
        {/* <div style={{ height: "5em", border: "2px solid black" }} /> */}
        <Title>File Information</Title>
        <Table rows={Object.entries(tableProps)} />
        {related_files.length ? <RelatedFiles files={related_files} /> : null}
        {this.props.meta ? (
          <React.Fragment>
            <Title>EXIF Data</Title>
            <Table rows={Object.entries(this.props.meta)} />
          </React.Fragment>
        ) : null}
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
