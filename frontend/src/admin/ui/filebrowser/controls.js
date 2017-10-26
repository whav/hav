/**
 * Created by sean on 06/02/17.
 */
import React from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import PropTypes from "prop-types";

import GoCloudUpload from "react-icons/go/cloud-upload";
import MdSelectAll from "react-icons/lib/md/select-all";
import FaCheckSquareO from "react-icons/lib/fa/check-square-o";
import FaSquareO from "react-icons/lib/fa/square-o";
import FaTable from "react-icons/lib/fa/table";
import FaList from "react-icons/lib/fa/list";
import FaPlusIcon from "react-icons/lib/fa/plus-circle";

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
        <GoCloudUpload /> Add files
      </Dropzone>
    );
  }
}

const SelectedFilesControls = ({ files, save }) => {
  let length = files.length;
  if (!length) {
    return null;
  }
  let desc;
  if (length === 1) {
    desc = "1 file";
  } else {
    desc = `${length} files`;
  }
  return (
    <Button onClick={() => save(files)} className="is-primary">
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
        <FaTable />
      </Button>
      <Button
        basic
        onClick={() => switchDisplayType("table")}
        className={classNames({ active: selectedDisplayType === "table" })}
      >
        <FaList />
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

  render() {
    const {
      selectAll,
      selectNone,
      invertSelection,
      files,
      saveFileSelection
    } = this.props;

    const controls = [
      <Button key="selectall" onClick={selectAll}>
        <FaCheckSquareO title="Check all" />
      </Button>,
      <Button key="unselectall" onClick={selectNone}>
        <FaSquareO title="Uncheck all" />
      </Button>,
      <Button
        key="invertselection"
        onClick={invertSelection}
        title="Invert Selection"
      >
        <FaCheckSquareO />
        ⇄
        <FaSquareO />
      </Button>,
      this.props.addDirectory ? (
        <Button key="create-directory" onClick={this.createDirectory}>
          <FaPlusIcon /> Add Folder
        </Button>
      ) : null,
      <SelectedFilesControls
        key="ingest"
        files={files}
        save={saveFileSelection}
      />
    ];
    return <ButtonGroup>{controls}</ButtonGroup>;
  }
}

FileBrowserMenu.propTypes = {
  selectAll: PropTypes.func.isRequired,
  selectNone: PropTypes.func.isRequired,
  invertSelection: PropTypes.func.isRequired
};

export { FilebrowserViewControl, UploadControl, FileBrowserMenu };
