/**
 * Created by sean on 06/02/17.
 */
import React from "react";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import {
  CheckboxBlankIcon,
  CheckboxCheckedIcon,
  AddIcon,
  GalleryIcon,
  ListIcon,
  UploadIcon,
  BurgerIcon,
  EditIcon
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

const SelectedFilesControls = ({ save, text = "Ingest" }) => {
  return (
    <Button onClick={save} className="is-primary">
      {text}
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

class FileBrowserSettingsDropdown extends React.Component {
  render() {
    const { isGrouped, toggleGrouped } = this.props;
    console.log(isGrouped, toggleGrouped);
    return (
      <div className="dropdown is-right is-hoverable">
        <div className="dropdown-trigger">
          <Button>
            <BurgerIcon />
          </Button>
        </div>
        <div className="dropdown-menu">
          <div className="dropdown-content">
            <div className="dropdown-item field">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isGrouped}
                  onChange={toggleGrouped}
                />
                Display grouped
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class FileBrowserMenu extends React.Component {
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
    const { allowUpload, uploadFile, toggleGrouped, isGrouped } = this.props;

    const controls = [
      allowUpload ? (
        <UploadControl key="upload" uploadFile={uploadFile} />
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
        <Link key="create-directory" className="button" to={`./add/`}>
          <AddIcon /> Add Folder
        </Link>
      ) : null,
      this.props.addDirectory ? (
        <Link key="edit-directory" className="button" to={`./edit/`}>
          <EditIcon /> Edit Folder
        </Link>
      ) : null,
      // hide this for now
      true ? null : (
        <FileBrowserSettingsDropdown
          key="fb-settings"
          isGrouped={isGrouped}
          toggleGrouped={toggleGrouped}
        />
      )
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

export {
  FilebrowserViewControl,
  UploadControl,
  FileBrowserMenu,
  SelectedFilesControls
};
