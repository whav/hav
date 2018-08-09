/**
 * Created by sean on 03/02/17.
 */

import { history } from "../../app";
import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import uniq from "lodash/uniq";
import PropTypes from "prop-types";
import { buildFrontendUrl } from "../../api/urls";

import {
  DirectoryIcon,
  SelectFileCheckboxIcon,
  VideoFallbackIcon,
  ImageFallbackIcon,
  AudioFallbackIcon,
  GenericFallbackIcon,
  HourglassIcon
} from "../icons";

import Breadcrumbs from "../components/breadcrumbs";

require("./index.css");

export class DirectoryListingBreadcrumbs extends React.Component {
  render() {
    let { dirs, current_dir } = this.props;
    let items = dirs.map((d, index) => <Link to={d.link}>{d.name}</Link>);
    return <Breadcrumbs items={items} />;
  }
}

export const FilePlaceHolder = props => {
  let Icon = GenericFallbackIcon;
  const { mime, className } = props;

  if (mime) {
    let category = mime.split("/")[0];
    console.log(category);
    switch (category) {
      case "video":
        Icon = VideoFallbackIcon;
        break;
      case "image":
        Icon = ImageFallbackIcon;
        break;
      case "audio":
        Icon = AudioFallbackIcon;
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
    this.state = {
      hasError: false,
      hasLoaded: false
    };
  }
  handleImageLoadError = e => {
    this.setState({
      hasError: true
    });
  };

  handleImageLoad = e => {
    this.setState({
      hasLoaded: true
    });
  };
  render() {
    const {
      src,
      sources = [],
      sizes = "100vw",
      alt = "image",
      title = "",
      mime_type = ""
    } = this.props;
    let { hasError } = this.state;
    if (hasError) {
      return <FilePlaceHolder mime={mime_type} />;
    }

    let srcSetProps = {};
    if (sources) {
      srcSetProps["srcSet"] = sources
        .map(([width, url]) => `${url} ${width}w`)
        .join(", ");
      // TODO: do something proper with the width
      srcSetProps["sizes"] = sizes;
    }
    return (
      <img
        src={src}
        {...srcSetProps}
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
  onClick,
  size
}) => {
  return (
    <div
      className={classNames("g-gallery-item", {
        selected: selected,
        "g-gallery-item-file": !directory,
        "g-gallery-directory": directory
      })}
      onClick={onClick}
      style={{ flexBasis: size }}
    >
      <span className={classNames("g-gallery-select", { green: selected })}>
        <SelectFileCheckboxIcon />
      </span>
      {preview}

      <div className="g-gallery-item-name">{name}</div>
    </div>
  );
};

class GGalleryDirectory extends React.Component {
  navigateOrSelect = e => {
    const { navigate, select } = this.props;
    e.ctrlKey ? select(e) : navigate(e);
  };

  render() {
    const { name, navigate, select, selected = false } = this.props;
    return (
      <GGalleryItem
        name={name}
        onClick={this.navigateOrSelect}
        directory={true}
        preview={<DirectoryIcon />}
        selected={selected}
      />
    );
  }
}

export const GGalleryFile = ({ file, toggleSelect, size, ...props }) => {
  let preview;
  if (file.preview_url) {
    let sources = [];
    let src = file.preview_url;
    if (Array.isArray(file.preview_url)) {
      sources = file.preview_url;
      src = file.preview_url[0][1];
    }
    preview = (
      <FallBackImageLoader
        src={src}
        sources={sources}
        sizes={size}
        title={`${file.name} ${file.mime}`}
        alt="preview image"
        mime_type={file.mime}
      />
    );
  } else {
    preview = <FilePlaceHolder mime={file.mime} />;
  }

  return (
    <GGalleryItem
      onClick={toggleSelect}
      name={file.name}
      preview={preview}
      size={size}
      {...props}
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
            fallbackImage={HourglassIcon}
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

  handleClick = (file, event) => {
    let { ctrlKey, shiftKey } = event;
    if (!ctrlKey && !shiftKey && file.url) {
      history.push(buildFrontendUrl(file.url));
    } else {
      this.handleFileSelectEvent(file, event);
    }
  };

  handleFileSelectEvent(file, event) {
    let { ctrlKey, shiftKey } = event;
    const key = file.url;
    // start off with a single selected file
    let selection = [key];

    if (ctrlKey || shiftKey) {
      // ctrl + already selected => deselect
      if (ctrlKey && this.props.selectedItemIds.has(key)) {
        selection = Array.from(this.props.selectedItemIds).filter(
          id => key !== id
        );
      } else {
        // else add to selection
        selection = [...this.props.selectedItemIds, ...selection];
      }
    }

    if (shiftKey) {
      // span a selection
      let start = this.allContentIds.indexOf(this.last_selected_id);
      let end = this.allContentIds.indexOf(key);
      let range = [start, end].sort((a, b) => a - b);
      // console.log(`selecting from ${range[0]} to ${range[1]}.`);
      selection = [
        ...selection,
        ...this.allContentIds.slice(range[0], range[1])
      ];
    }
    selection = uniq(selection);
    this.last_selected_id = file.url;
    this.props.handleSelect(selection);
  }

  render() {
    let {
      directories = [],
      files = [],
      uploads = [],
      displayType,
      selectedItemIds,
      handleSelect,
      settings
    } = this.props;

    const size = settings.gallerySize;

    if (files.length + directories.length === 0) {
      return null;
    }

    // keep track of all ids in the same order in which they are displayed
    this.allContentIds = [
      ...directories.map(d => d.url),
      ...files.map(f => f.url)
    ];

    let renderedDirectories = directories.map((directory, index) => {
      return (
        <GGalleryDirectory
          {...directory}
          select={this.handleClick.bind(this, directory)}
          key={index}
          selected={selectedItemIds.has(directory.url)}
          settings={this.props.settings}
          size={size}
        />
      );
    });

    let rendererFiles = files.map((file, index) => {
      let props = {
        file,
        toggleSelect: this.handleClick.bind(this, file),
        selected: selectedItemIds.has(file.url),
        size
      };
      return <GGalleryFile key={index} {...props} />;
    });

    // let renderedUploads = Object.values(uploads).map((upload, index) => {
    //   return <GGalleryUpload upload={upload} key={index} />;
    // });

    return (
      <div className="g-gallery">
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
