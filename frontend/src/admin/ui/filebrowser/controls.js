/**
 * Created by sean on 06/02/17.
 */
import React from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import PropTypes from "prop-types";

import {
  CheckboxBlankIcon,
  CheckboxCheckedIcon,
  AddIcon,
  GalleryIcon,
  ListIcon,
  UploadIcon
} from "../icons";

import Button, { ButtonGroup } from "../components/buttons";

class UploadControl extends React.Component {
  handleDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(f => this.props.uploadFile(f));
  };

  render() {
    return (
      <Dropzone onDrop={this.handleDrop} className="--foo">
        <Button>
          <UploadIcon /> Add files
        </Button>
      </Dropzone>
    );
  }
}

UploadControl.propTypes = {
  uploadFile: PropTypes.func.isRequired
};

const SelectedFilesControls = ({ save }) => {
  return (
    <Button onClick={save} className="is-primary">
      Ingest
    </Button>
  );
};

const FilebrowserViewControl = ({ selectedDisplayType, switchDisplayType }) => {
  return (
    <div>
      <Button
        basic
        onClick={() => switchDisplayType("g-gallery")}
        className={classNames({ active: selectedDisplayType === "g-gallery" })}
      >
        <GalleryIcon />
      </Button>
      <Button
        basic
        onClick={() => switchDisplayType("table")}
        className={classNames({ active: selectedDisplayType === "table" })}
      >
        <ListIcon />
      </Button>
    </div>
  );
};

class FileBrowserMenu extends React.Component {
  constructor(props) {
    super(props);
    this.createDirectory = this.createDirectory.bind(this);
  }

  createDirectory() {
    let name = window.prompt(
      "Please enter a name for the folder to be created",
      ""
    );
    if (name) {
      this.props.addDirectory(name);
    }
  }

  selectAll = () => {
    this.props.handleSelect(Array.from(this.props.allItemIds));
  };

  invertSelection = () => {
    const all = new Set(this.props.allItemIds);
    const selected = new Set(this.props.selectedItemIds);
    this.props.handleSelect(Array.from(all).filter(id => !selected.has(id)));
  };

  selectNone = () => {
    this.props.handleSelect([]);
  };

  render() {
    const {
      saveFileSelection,
      selectedItemIds,
      allowUpload,
      uploadFile
    } = this.props;

    const controls = [
      allowUpload ? (
        <UploadControl key="upload" uploadFile={uploadFile} />
      ) : null,
      selectedItemIds.length > 0 ? (
        <SelectedFilesControls key="ingest" save={saveFileSelection} />
      ) : null,
      <Button key="selectall" onClick={this.selectAll}>
        <CheckboxCheckedIcon title="Check all" />
      </Button>,
      <Button key="unselectall" onClick={this.selectNone}>
        <CheckboxBlankIcon title="Uncheck all" />
      </Button>,
      <Button
        key="invertselection"
        onClick={this.invertSelection}
        title="Invert Selection"
      >
        <CheckboxCheckedIcon />⇄<CheckboxBlankIcon />
      </Button>,
      this.props.addDirectory ? (
        <Button key="create-directory" onClick={this.createDirectory}>
          <AddIcon /> Add Folder
        </Button>
      ) : null
    ];
    return <ButtonGroup>{controls}</ButtonGroup>;
  }
}

FileBrowserMenu.propTypes = {
  selectedItemIds: PropTypes.array.isRequired,
  // allItemIds: PropTypes.array.isRequired,
  handleSelect: PropTypes.func.isRequired,
  saveFileSelection: PropTypes.func.isRequired
};

export { FilebrowserViewControl, UploadControl, FileBrowserMenu };
