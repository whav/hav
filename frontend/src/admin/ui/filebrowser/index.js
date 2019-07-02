/**
 * Created by sean on 03/02/17.
 */

import { history } from "../../app";
import React from "react";
import ImageLoader from "react-load-image";
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

const DirectoryListingBreadcrumbs = ({ dirs, current_dir }) => {
  const create_link = d => <Link to={d.link || "#"}>{d.name}</Link>;
  let items = dirs.map(create_link);
  current_dir && items.push(create_link(current_dir));
  return <Breadcrumbs items={items} />;
};

export { DirectoryListingBreadcrumbs };

export const FilePlaceHolder = props => {
  let Icon = GenericFallbackIcon;
  const { mime, className } = props;

  if (mime) {
    let category = mime.split("/")[0];
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
  return <Icon className={className} />;
};

const FallBackImageLoader = props => {
  let { alt, src, srcSet, styles = {}, title, mime_type } = props;
  // console.log(src, srcSet);
  if (srcSet && Array.isArray(srcSet)) {
    srcSet = srcSet.map(([width, url]) => `${url} ${width}w`).join(", ");
    // src = "";
  }
  if (src || srcSet) {
    return (
      <ImageLoader src={src} srcSet={srcSet}>
        <img title={title} alt={alt} className="image" styles={styles} />
        <FilePlaceHolder title={title} mime={mime_type} />
        <FilePlaceHolder title={title} mime={mime_type} />
      </ImageLoader>
    );
  } else {
    return <FilePlaceHolder title={title} mime={mime_type} />;
  }
};

FallBackImageLoader.propTypes = {
  src: PropTypes.string,
  sources: PropTypes.array,
  mime_type: PropTypes.string
};

export { FallBackImageLoader };

const GGalleryItem = ({
  name,
  directory = false,
  selected = false,
  onClick,
  size,
  children
}) => {
  return (
    <div
      className={classNames("g-gallery-item", {
        selected,
        "g-gallery-item-file": !directory,
        "g-gallery-directory": directory
      })}
      onClick={onClick}
      style={{ flexBasis: size }}
    >
      <span className={classNames("g-gallery-select", { green: selected })}>
        <SelectFileCheckboxIcon />
      </span>
      {children}

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
        selected={selected}
      >
        <DirectoryIcon />
      </GGalleryItem>
    );
  }
}

export const GGalleryFile = ({
  name,
  file,
  toggleSelect,
  size,
  children = null,
  ...props
}) => {
  let preview = <FilePlaceHolder mime={file.mime_type} />;
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
        title={`${file.name} (${file.mime_type})`}
        alt="preview image"
        mime_type={file.mime}
      />
    );
  }
  return (
    <GGalleryItem
      onClick={toggleSelect}
      name={name || file.name}
      size={size}
      {...props}
    >
      {preview}
      {children}
    </GGalleryItem>
  );
};

export const GGalleryMultiFile = ({ files, ...props }) => {
  const file = files[0];
  return (
    <GGalleryFile file={file} {...props}>
      {files.length > 1 ? (
        <span className="g-gallery-item-count has-text-grey-light">
          {files.length}
        </span>
      ) : null}
    </GGalleryFile>
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

  handleClick = (files, event) => {
    const file = files[0];
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
      groupedFiles = {},
      uploads = [],
      displayType,
      selectedItemIds,
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

    // renderedFile need to respect the grouped settings
    // and render differently depending on it
    let rendererFiles = [];
    if (settings.displayGrouped) {
      rendererFiles = Object.entries(groupedFiles).map(
        ([group, files], index) => {
          const file = files[0];
          const selected = selectedItemIds.has(file.url);
          const props = {
            name: file.name,
            files,
            toggleSelect: this.handleClick.bind(this, [file]),
            selected,
            size
          };
          return <GGalleryMultiFile key={index} {...props} />;
        }
      );
    } else {
      rendererFiles = files.map((file, index) => {
        let props = {
          file,
          toggleSelect: this.handleClick.bind(this, [file]),
          selected: selectedItemIds.has(file.url),
          size
        };
        return <GGalleryFile key={index} {...props} />;
      });
    }

    let renderedUploads = Object.values(uploads).map((upload, index) => {
      return <GGalleryUpload upload={upload} key={index} />;
    });

    return (
      <div className="g-gallery">
        {renderedDirectories}
        {renderedUploads}
        {rendererFiles}
      </div>
    );
  }
}

export const Header = ({ title = "", aside = null }) => {
  return (
    <header>
      <div className="columns hav-admin-fb-header">
        <div className="column is-two-thirds title">{title}</div>
        {aside ? <div className="column has-text-right">{aside}</div> : null}
      </div>
    </header>
  );
};

export const FileBrowserInterface = ({
  header = null,
  main = null,
  footer = null
}) => {
  return (
    <section className="filebrowser">
      {header ? header : null}
      <main>{main}</main>
      {footer ? footer : null}
    </section>
  );
};
