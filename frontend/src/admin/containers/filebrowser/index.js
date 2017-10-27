/**
 * Created by sean on 09/02/17.
 */
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import pathToRegexp from "path-to-regexp";
import PropTypes from "prop-types";

import {
  requestDirectoryAction,
  switchFilebrowserDisplayType,
  toggleSelect,
  toggleSelectAll,
  createDirectoryAction,
  selectItems
} from "../../actions/browser";

import {
  getIngestionQueues,
  queueFilesForIngestion
} from "../../actions/ingest";

import LoadingIndicator from "../../ui/loading";

import Level from "../../ui/components/level";

import FileList, {
  DirectoryListingBreadcrumbs,
  DirectoryListing,
  fileListDisplayValues,
  FileBrowserInterface
} from "../../ui/filebrowser";

import { FileBrowserMenu } from "../../ui/filebrowser/controls";
import UploadTrigger from "../uploads";

import {
  getDirectoryForPath,
  getFilesForPath,
  stripSlashes
} from "../../reducers/browser";

import { buildAPIUrl } from "../../api/browser";

import { getUploadsForPath } from "../../reducers/uploads";

class FileBrowser extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.loadCurrentDirectory();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.match.url !== this.props.match.url) {
      newProps.loadCurrentDirectory();
    }
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    } else {
      let {
        directory,
        parentDirectories,
        childrenDirectories,
        files,
        settings,
        switchDisplayStyle,
        selectFiles,
        buildFrontendURL,
        path,
        allowUpload,
        allowCreate,
        saveFileSelection,
        createDirectory,
        selectItems
      } = this.props;

      let uploads = this.props.uploads;
      let breadcrumbs = (
        <DirectoryListingBreadcrumbs
          dirs={parentDirectories.map(d => {
            return {
              ...d,
              link: buildFrontendURL(d.path)
            };
          })}
          current_dir={directory.name}
        />
      );

      // spice up the directories
      let directories = childrenDirectories.map(d => {
        return {
          ...d,
          navigate: () => {
            this.props.history.push(buildFrontendURL(d.path));
          }
        };
      });

      let isEmpty =
        childrenDirectories.length + files.length + uploads.length === 0;

      // new
      let selectedItemIds = new Set(directory.selected);

      const header_items = [
        <h1 key="title" className="title">
          {directory.name}
        </h1>,
        <Level
          key="fb-menu"
          left={breadcrumbs}
          right={
            <FileBrowserMenu
              switchDisplayType={switchDisplayStyle}
              selectedDisplayType={settings.selectedDisplayType}
              addDirectory={allowCreate ? createDirectory : false}
              selectedItemIds={Array.from(selectedItemIds)}
              allItemIds={directory.content}
              handleSelect={selectItems}
              saveFileSelection={saveFileSelection}
            />
          }
        />
      ];

      const main = isEmpty ? (
        <h2>This directory is empty.</h2>
      ) : (
        <FileList
          directories={directories}
          files={files}
          uploads={uploads}
          displayType={settings.selectedDisplayType}
          handleSelect={selectItems}
          selectedItemIds={selectedItemIds}
        />
      );

      return <FileBrowserInterface header={header_items} main={main} />;
    }
  }
}

FileBrowser.propTypes = {
  loading: PropTypes.bool.isRequired,
  // useful stuff here ...
  files: PropTypes.array,
  directory: PropTypes.object.isRequired,
  loadCurrentDirectory: PropTypes.func.isRequired,
  parentDirectories: PropTypes.array,
  childrenDirectories: PropTypes.array,
  switchDisplayStyle: PropTypes.func.isRequired,
  settings: PropTypes.object,
  saveFileSelection: PropTypes.func,
  allowUpload: PropTypes.bool,
  allowCreate: PropTypes.bool
};

export default connect(
  (rootState, props) => {
    const state = rootState.repositories;
    const uploadState = rootState.uploads;
    const settings = state.settings;
    const path = props.match.params;

    const key = buildAPIUrl(path.repository, path.path);
    // construct a helper function to build frontend urls
    const baseURL = pathToRegexp.compile(props.match.path)({
      repository: path.repository
    });
    const buildFrontendURL = p => {
      p = stripSlashes(p);
      return p ? `${baseURL}${p}/` : baseURL;
    };

    // let directory = getDirectoryForPath(path, state);
    let directory = state.filesByUri[key];

    let mappedProps = {
      directory,
      path,
      buildFrontendURL
    };

    if (directory === undefined || !directory.lastLoaded) {
      // console.warn("Unable to find directory for key", key);
      return {
        ...mappedProps,
        loading: true,
        directory: {}
      };
    }

    const allChildren = (directory.content || []).map(c => state.filesByUri[c]);
    const parentDirectories = (directory.parents || []).map(d => {
      return state.filesByUri[d];
    });

    // populate children dirs and files from state
    const childrenDirectories = allChildren.filter(c => c.isDirectory);
    const files = allChildren.filter(c => c.isFile);

    // get the un-finished uploads for directory
    let directoryUploads = Object.values(
      getUploadsForPath(props.match.params, uploadState)
    ).filter(u => !u.finished);

    const saveFileSelection = () =>
      props.history.push("/ingest/step1/", directory.selected);
    return {
      ...mappedProps,
      loading: false,
      directory,
      uploads: directoryUploads,
      settings,
      childrenDirectories,
      parentDirectories,
      files,
      saveFileSelection,
      allowUpload: directory.allowUpload || false,
      allowCreate: directory.allowCreate || false
    };
  },
  (dispatch, props) => {
    let path = { ...props.match.params };
    let apiURL = `/api/v1/${path.repository}/`;
    if (path.path) {
      apiURL = `${apiURL}${path.path}/`;
    }
    const key = buildAPIUrl(path.repository, path.path);

    return {
      uploadToURL: apiURL,
      loadCurrentDirectory: () => {
        dispatch(requestDirectoryAction(path, apiURL));
      },
      switchDisplayStyle: style =>
        dispatch(switchFilebrowserDisplayType(style)),
      createDirectory: name =>
        dispatch(createDirectoryAction(name, path, apiURL)),
      selectItems: (items = []) => dispatch(selectItems(key, items))
    };
  }
)(FileBrowser);
