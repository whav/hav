import React from "react";
import { Link } from "react-router-dom";

import GoFileDirectory from "react-icons/go/file-directory";

import LoadingIndicator from "../loading";

import Error from "../components/errors";
import Breadcrumbs from "../components/breadcrumbs";
import Button from "../components/buttons";
import {
  FileBrowserInterface,
  DirectoryListingBreadcrumbs
} from "../filebrowser/index";

require("./ingest.css");

const IngestErrorNofiles = props => {
  return (
    <Error>
      No files selected. <br />
      Please select some files from the available sources.
    </Error>
  );
};

export const Directory = props => {
  return (
    <div>
      <GoFileDirectory />
      <span>{props.name}</span>
    </div>
  );
};

class DirectorySelector extends React.Component {
  render() {
    let { parentDirs = [], currentDirectory } = this.props;

    let breadcrumbs = [];
    let i = 0;
    let links = parentDirs.map(d => {
      return (
        <Link
          key={d.url}
          onClick={e => {
            e.preventDefault();
            this.props.navigate(d.path);
          }}
        >
          {d.name}
        </Link>
      );
    });
    // add current directory to breadcrumbs
    links.push(<span>{currentDirectory.name}</span>);
    parentDirs = <Breadcrumbs>{breadcrumbs}</Breadcrumbs>;

    return (
      <div>
        {parentDirs}
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
        {this.props.loading ? (
          <LoadingIndicator />
        ) : (
          <div className="directory-selector">
            {this.props.directories.map(d => (
              <div className="directory" key={d.path}>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    this.props.navigate(d.path);
                  }}
                >
                  <Directory name={d.name} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

class IngestView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    let { ingestionIds } = this.props;

    const parentLinks = this.props.parentDirs.map(d => (
      <a href="#" onClick={e => this.props.navigate(d.path)}>
        {d.name}
      </a>
    ));
    const header = [
      <Breadcrumbs key={1} items={parentLinks} />,
      <h1 key={2}>Select a target folder</h1>
    ];
    const footer = (
      <Button onClick={() => this.props.ingest()} className="is-primary">
        {`Ingest`}
      </Button>
    );
    const main = [
      ingestionIds.length === 0 ? <IngestErrorNofiles /> : null,
      this.props.children
    ];

    return <FileBrowserInterface header={header} main={main} footer={footer} />;
  }
}

export default IngestView;
export { DirectorySelector };
