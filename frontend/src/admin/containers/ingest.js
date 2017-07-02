import React from "react";
import { connect } from "react-redux";
import IngestView, { DirectorySelector } from "../ui/ingest";
import FileBrowser from "./filebrowser/index";
import { requestDirectoryAction } from "../actions/browser";
import { ingestTo } from "../actions/ingest";

import { getDirectoryForPath } from "../reducers/browser";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    props.loadDirectory(props.path);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.path !== this.props.path) {
      newProps.loadDirectory(newProps.path);
    }
  }

  render() {
    return (
      <IngestView
        files={this.props.filesToBeIngested}
        ingest={() => this.props.ingest(this.props.directory.url)}
      >
        <DirectorySelector
          currentDirectory={this.props.directory}
          directories={this.props.directories}
          loading={this.props.loading}
          navigate={this.props.navigate}
          parentDirs={this.props.parentDirs}
        />
      </IngestView>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const ingestState = state.ingest;
    const filesToBeIngested = ownProps.location.state;

    let directory = getDirectoryForPath(
      { repository: "hav", path: ingestState.ingestTo },
      state.repositories
    );
    let props = {
      filesToBeIngested,
      directory: directory || {},
      path: ingestState.ingestTo
    };

    if (directory === undefined || !directory.lastLoaded) {
      return {
        ...props,
        loading: true
      };
    }

    let parentDirs = (directory.parents || [])
      .map(d => getDirectoryForPath(d, state.repositories));
    let childrenDirs = (directory.children || [])
      .map(d => getDirectoryForPath(d, state.repositories));
    return {
      ...props,
      loading: false,
      directories: childrenDirs,
      parentDirs: parentDirs
    };
  },
  (dispatch, ownProps) => {
    return {
      loadDirectory: path => {
        let apiURL = `/api/v1/hav/`;
        if (path) {
          apiURL = `${apiURL}${path}/`;
        }
        dispatch(
          requestDirectoryAction({ repository: "hav", path: path }, apiURL)
        );
      },
      navigate: path => dispatch(ingestTo(path)),
      ingest: path =>
        console.log("Ingesting", ownProps.location.state, path, ownProps)
    };
  }
)(Ingest);
