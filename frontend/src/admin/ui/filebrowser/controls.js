/**
 * Created by sean on 06/02/17.
 */
import React from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import PropTypes from "prop-types";

import {
  MdCheckBoxOutlineBlank as CheckboxBlankIcon,
  MdCheckBox as CheckboxCheckedIcon,
  MdAddBox as AddIcon,
  MdViewModule as GalleryIcon,
  MdViewList as ListIcon,
  MdFileUpload as UploadIcon
} from "react-icons/md";

import Button, { ButtonGroup } from "../components/buttons";

class UploadControl extends React.Component {
  constructor(props) {
    super(props);
    this.handleDrop = this.handleDrop.bind(this);
  }
  handleDrop(acceptedFiles, rejectedFiles) {
    this.props.uploadFiles(acceptedFiles, rejectedFiles);
  }
  render() {
    return (
      <Dropzone onDrop={this.handleDrop} className="--foo">
        <UploadIcon /> Add files
      </Dropzone>
    );
  }
}

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
    const { saveFileSelection, selectedItemIds } = this.props;

    const controls = [
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
  allItemIds: PropTypes.array.isRequired,
  handleSelect: PropTypes.func.isRequired,
  saveFileSelection: PropTypes.func.isRequired
};

export { FilebrowserViewControl, UploadControl, FileBrowserMenu };
