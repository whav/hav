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
  createDirectoryAction,
  selectItems
} from "../../actions/browser";

import { queueForIngestion } from "../../actions/ingest";

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
import { buildFrontendUrl, buildApiUrl } from "../../api/urls";

import { getUploadsForPath } from "../../reducers/uploads";

class FileBrowserDirectory extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    } else {
      const {
        directory,
        parentDirectories,
        childrenDirectories,
        files,
        settings,
        switchDisplayStyle,
        selectFiles,
        path,
        allowUpload,
        allowCreate,
        saveFileSelection,
        createDirectory,
        selectItems,
        ingestable
      } = this.props;

      let uploads = this.props.uploads;
      let breadcrumbs = (
        <DirectoryListingBreadcrumbs
          dirs={parentDirectories.map(d => {
            return {
              ...d,
              link: buildFrontendUrl(d.url)
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
            this.props.history.push(buildFrontendUrl(d.url));
          }
        };
      });

      let isEmpty =
        childrenDirectories.length + files.length + uploads.length === 0;

      const selectedItemIds = new Set(directory.selected);
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
              selectedItemIds={Array.from(ingestable)}
              allItemIds={directory.content}
              handleSelect={selectItems}
              saveFileSelection={() =>
                saveFileSelection(Array.from(ingestable))
              }
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
          settings={settings}
        />
      );

      const footer = this.props.footer || null;

      return (
        <FileBrowserInterface
          header={header_items}
          main={main}
          footer={footer}
        />
      );
    }
  }
}

FileBrowserDirectory.propTypes = {
  files: PropTypes.array,
  directory: PropTypes.object.isRequired,
  parentDirectories: PropTypes.array,
  childrenDirectories: PropTypes.array,
  switchDisplayStyle: PropTypes.func.isRequired,
  settings: PropTypes.object,
  saveFileSelection: PropTypes.func,
  allowUpload: PropTypes.bool,
  allowCreate: PropTypes.bool
};

const FileBrowserDirectoryView = connect(
  (rootState, props) => {
    const state = rootState.repositories;
    const uploadState = rootState.uploads;
    const settings = state.settings;
    const { path, repository } = props.match.params;

    const key = buildApiUrl(props.location.pathname);
    let directory = props.data;
    let mappedProps = {
      directory,
      path
    };
    console.warn(settings);
    const allChildren = (directory.content || []).map(c => state.browser[c]);
    const parentDirectories = (directory.parents || []).map(d => {
      return state.browser[d];
    });

    // populate children dirs and files from state
    const childrenDirectories = allChildren.filter(c => c.isDirectory);
    const files = allChildren.filter(c => c.isFile);
    console.warn(files);
    // get a list of all ingestable and selected items
    const selected = new Set(directory.selected);
    const ingestable = allChildren
      .filter(f => selected.has(f.url) && f.ingestable)
      .map(f => f.url);

    // get the un-finished uploads for directory
    let directoryUploads = Object.values(
      getUploadsForPath(props.match.params, uploadState)
    ).filter(u => !u.finished);

    return {
      ...mappedProps,
      loading: false,
      directory,
      uploads: directoryUploads,
      settings,
      childrenDirectories,
      parentDirectories,
      files,
      ingestable,
      allowUpload: directory.allowUpload || false,
      allowCreate: directory.allowCreate || false
    };
  },
  (dispatch, props) => {
    const apiURL = buildApiUrl(props.location.pathname);

    const saveFileSelection = ids => {
      dispatch(queueForIngestion(ids));
      props.history.push("/hav/");
    };

    return {
      saveFileSelection,
      uploadToURL: apiURL,

      switchDisplayStyle: style =>
        dispatch(switchFilebrowserDisplayType(style)),
      createDirectory: name =>
        dispatch(createDirectoryAction(name, path, apiURL)),
      selectItems: (items = []) => dispatch(selectItems(apiURL, items))
    };
  }
)(FileBrowserDirectory);

FileBrowserDirectoryView.propTypes = {
  data: PropTypes.object
};

export default FileBrowserDirectoryView;