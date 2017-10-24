import PropTypes from "prop-types";
/**
 * Created by sean on 03/02/17.
 */
import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import filesize from "filesize";

import GoFileDirectory from "react-icons/go/file-directory";
import GoFileMedia from "react-icons/go/file-media";
import GoCheck from "react-icons/go/check";
import GoHourglass from "react-icons/go/hourglass";
import FaFileImageO from "react-icons/fa/file-image-o";
import FaFileMovieO from "react-icons/fa/file-movie-o";
import FaFileAudioO from "react-icons/fa/file-audio-o";
import FaChainBroken from "react-icons/fa/chain-broken";

import Breadcrumbs from "../components/breadcrumbs";

require("./index.css");

export class DirectoryListingBreadcrumbs extends React.Component {
  render() {
    let { dirs } = this.props;
    let crumbs = [];
    let items = dirs.map((d, index) => <Link to={d.link}>{d.name}</Link>);
    return <Breadcrumbs items={items} />;
  }
}

const FilePlaceHolder = ({ mime, className }) => {
  let Icon = GoFileMedia;
  if (mime) {
    let category = mime.split("/")[0];
    switch (category) {
      case "video":
        Icon = FaFileMovieO;
        break;
      case "image":
        Icon = FaFileImageO;
        break;
      case "audio":
        Icon = FaFileAudioO;
        break;
      default:
        break;
    }
  }
  return <Icon title={mime || ""} className={className} />;
};

export class FallBackImageLoader extends React.Component {
  constructor(props) {
    super(props);
    this.handleImageLoadError = this.handleImageLoadError.bind(this);
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.state = {
      hasError: false,
      hasLoaded: false
    };
  }
  handleImageLoadError(e) {
    this.setState({
      hasError: true
    });
  }

  handleImageLoad(e) {
    this.setState({
      hasLoaded: true
    });
  }
  render() {
    let {
      src,
      alt = "image",
      title = "",
      fallbackImage = FaChainBroken
    } = this.props;
    let { hasError } = this.state;
    if (hasError) {
      let FallBackImage = fallbackImage;
      return <FallBackImage />;
    }
    return (
      <img
        src={src}
        onError={this.handleImageLoadError}
        title={title}
        alt={alt}
      />
    );
  }
}

FallBackImageLoader.propTypes = {
  src: PropTypes.string.isRequired
};

const GGalleryItem = ({
  name,
  preview,
  directory = false,
  selected = false,
  onClick
}) => {
  return (
    <div
      className={classNames("g-gallery-item", {
        selected: selected,
        "g-gallery-item-file": !directory,
        "g-gallery-directory": directory
      })}
      onClick={onClick}
    >
      <span className={classNames("g-gallery-select", { green: selected })}>
        <GoCheck />
      </span>
      {/*<div className='preview'>*/}
      {preview}
      {/*</div>*/}

      <div className="g-gallery-item-name">{name}</div>
    </div>
  );
};

export const GGalleryDirectory = ({ name, navigate }) => {
  return (
    <GGalleryItem
      name={name}
      onClick={navigate}
      directory={true}
      preview={<GoFileDirectory />}
      selected={false}
    />
  );
};

export const GGalleryFile = ({ file, toggleSelect }) => {
  let preview = file.preview_url ? (
    <FallBackImageLoader
      src={file.preview_url}
      title={`${file.name} ${file.mime}`}
      alt="preview image"
    />
  ) : (
    <FilePlaceHolder mime={file.mime} />
  );

  return (
    <GGalleryItem
      onClick={toggleSelect}
      name={file.name}
      preview={preview}
      selected={file.selected}
    />
  );
};

const GGalleryUpload = ({ upload }) => {
  return (
    <div className={classNames("g-gallery-item")}>
      <div className="g-gallery-item-preview">
        {upload.preview ? (
          <FallBackImageLoader
            src={upload.preview}
            fallbackImage={GoHourglass}
          />
        ) : null}
      </div>
      <div className="g-gallery-item-name">
        <progress max={100} value={upload.progress}>
          {upload.file}
        </progress>
        <span>{upload.name}</span>
      </div>
    </div>
  );
};

// we can try to extend this in the future to
// enable multiple ways of listing files and directories
const fileListDisplayOptions = {
  tiles: null
};
// exported, because the selected file list type is stored in the state object
export const fileListDisplayValues = Object.keys(fileListDisplayOptions);

export default class FileList extends React.Component {
  constructor(props) {
    super(props);
    this.handleFileSelectEvent = this.handleFileSelectEvent.bind(this);
  }

  handleFileSelectEvent(file, event) {
    let { ctrlKey, shiftKey } = event;
    let deselectOthers = true;
    let spanSelection = false;

    if (ctrlKey || shiftKey) {
      deselectOthers = false;
    }

    if (shiftKey) {
      spanSelection = true;
    }

    let modifiers = {
      deselectOthers,
      spanSelection
    };

    this.props.handleSelect([file], modifiers);
  }

  render() {
    let {
      directories = [],
      files = [],
      uploads = [],
      displayType
    } = this.props;

    if (files.length + directories.length === 0) {
      return null;
    }

    let renderedDirectories = directories.map((directory, index) => {
      return <GGalleryDirectory {...directory} key={index} />;
    });

    let rendererFiles = files.map((file, index) => {
      let props = {
        file: file,
        toggleSelect: this.handleFileSelectEvent.bind(this, file)
      };
      return <GGalleryFile key={index} {...props} />;
    });

    // let renderedUploads = Object.values(uploads).map((upload, index) => {
    //   return <GGalleryUpload upload={upload} key={index} />;
    // });

    return (
      <div className="g-gallery columns is-multiline">
        {renderedDirectories}
        {rendererFiles}
        {/*{renderedUploads}*/}
      </div>
    );
  }
}

export const FileBrowserInterface = ({
  header = null,
  main = null,
  footer = null
}) => {
  return (
    <section className="filebrowser">
      {header ? <header>{header}</header> : null}
      <main>{main}</main>
      {footer ? <footer>{footer}</footer> : null}
    </section>
  );
};
