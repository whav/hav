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

import Button from "../components/buttons";

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

const SelectionControls = ({ selectAll, selectNone, invertSelection }) => {
  return (
    <div>
      <Button onClick={selectAll}>
        <FaCheckSquareO title="Check all" />
      </Button>
      <Button onClick={selectNone}>
        <FaSquareO title="Uncheck all" />
      </Button>
      <Button onClick={invertSelection} title="Invert Selection">
        <FaCheckSquareO />
        ⇄
        <FaSquareO />
      </Button>
    </div>
  );
};

SelectionControls.propTypes = {
  selectAll: PropTypes.func.isRequired,
  selectNone: PropTypes.func.isRequired,
  invertSelection: PropTypes.func.isRequired
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
    let props = this.props;
    return (
      <div>
        {props.name ? <h1 className="title">{props.name}</h1> : null}
        <div className="columns">
          <div className="column">
            <SelectionControls
              selectAll={props.selectAll}
              selectNone={props.selectNone}
              invertSelection={props.invertSelection}
            />
          </div>
          <div className="column">
            <SelectedFilesControls
              files={props.files}
              save={props.saveFileSelection}
            />
            {props.addDirectory ? (
              <Button key="create-directory" onClick={this.createDirectory}>
                <FaPlusIcon /> Add Folder
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export { FilebrowserViewControl, UploadControl, FileBrowserMenu };
