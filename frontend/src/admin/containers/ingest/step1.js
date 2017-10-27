import React from "react";
import { connect } from "react-redux";
import IngestView, { DirectorySelector } from "../../ui/ingest/step1";
import FileBrowser from "../filebrowser/index";
import { requestDirectoryAction } from "../../actions/browser";
import { ingestTo } from "../../actions/ingest";
import Loading from "../../ui/loading";
import { getDirectoryForPath } from "../../reducers/browser";
import { buildAPIUrl } from "../../api/browser";

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
    if (this.props.loading) {
      return <Loading />;
    }
    console.warn(this.props);
    return (
      <IngestView
        ingestionIds={this.props.ingestionIds}
        ingest={() => this.props.ingest(this.props.directory.url)}
        parentDirs={this.props.parentDirs}
        navigate={this.props.navigate}
      >
        {/* TODO: Replace this! */}
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
    // selected files are in location state
    const ingestionIds = ownProps.location.state;
    const key = buildAPIUrl("hav", ingestState.ingestTo);
    const directory = state.repositories.filesByUri[key];
    console.log(key);
    let props = {
      ingestionIds,
      directory: directory,
      path: ingestState.ingestTo
    };

    if (directory === undefined || !directory.lastLoaded) {
      return {
        ...props,
        loading: true
      };
    }

    let parentDirs = (directory.parents || []).map(d =>
      getDirectoryForPath(d, state.repositories)
    );

    let childrenDirs = (directory.children || []).map(d =>
      getDirectoryForPath(d, state.repositories)
    );

    // this will trigger the actual ingestion
    const ingest = () => {
      ownProps.history.push("/ingest/step2/", {
        files: filesToBeIngested,
        target: directory
      });
    };

    return {
      ...props,
      loading: false,
      directories: childrenDirs,
      parentDirs: parentDirs,
      ingest
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
      navigate: path => dispatch(ingestTo(path))
    };
  }
)(Ingest);
