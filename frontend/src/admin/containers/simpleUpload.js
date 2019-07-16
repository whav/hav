import React from "react";
import Dropzone from "react-dropzone";
import uuid from "uuid/v4";
import { Link } from "react-router-dom";
import upload from "../api/upload";
import { uploadURL } from "../api/urls";
import { listRecentUploads } from "../api/upload";

import { UploadIcon } from "../ui/icons";
import ProgressBar from "../ui/components/progress";
import Error from "../ui/components/errors";
import "./simpleUpload.css";

const buildDetailURL = pk => `/sources/upload/${pk}/`;

class UploadControl extends React.Component {
  handleDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length) {
      const multiple = rejectedFiles.length > 1;
      alert(
        `The file${multiple ? "s" : ""} ${rejectedFiles.join(", ")} ${
          multiple ? "were" : "was"
        } rejected.`
      );
    } else {
      acceptedFiles.forEach(f => this.props.uploadFile(f));
    }
  };

  render() {
    return (
      <Dropzone style={{}} onDrop={this.handleDrop}>
        <div className="upload-trigger button is-large is-fullwidth is-outlined">
          <UploadIcon /> Add files
        </div>
      </Dropzone>
    );
  }
}

const SingleUpload = ({
  file,
  success,
  error,
  progress,
  preview,
  ...props
}) => {
  const preview_url = preview || file.preview || file.preview_url;
  const title = file.path ? (
    <Link to={buildDetailURL(file.path)}>{file.name}</Link>
  ) : (
    file.name
  );
  return (
    <div className="media box">
      <div className="media-left">
        {preview_url ? (
          <img className="image" src={preview_url} alt="preview image" />
        ) : null}
      </div>
      <div className="media-content">
        {error ? <Error>There was an error uploading this file.</Error> : null}

        <h3 className="subtitle is-5">{title}</h3>

        {/* display progress bar  */}
        {!success && progress < 100 ? (
          <ProgressBar
            max={100}
            progress={progress}
            error={error}
            success={success}
          />
        ) : null}
      </div>
    </div>
  );
};

class UploadContainer extends React.Component {
  state = {
    uploads: {}
  };

  setUploadState = (key, uploadState) => {
    this.setState(state => {
      const prevState = state.uploads[key];
      return {
        uploads: {
          ...state.uploads,
          [key]: {
            ...prevState,
            ...uploadState
          }
        }
      };
    });
  };

  uploadFile = file => {
    // generate a unique key for the upload
    const key = uuid();

    // set default state for the upload
    this.setState(state => {
      return {
        uploads: {
          [key]: {
            file,
            progress: 0,
            success: false,
            error: false
          },
          ...state.uploads
        }
      };
    });

    // build progress functions
    const update = s => this.setUploadState(key, s);
    const onProgress = p => update({ progress: p });
    const onSuccess = resp => {
      update({ success: true, error: false, file: resp });
    };
    const onError = () => update({ error: true, success: false });

    // finally start the upload
    upload(file, uploadURL, onSuccess, onProgress, onError);
  };

  render = () => {
    return (
      <>
        <UploadControl uploadFile={this.uploadFile} />

        {Object.entries(this.state.uploads).map(([key, props]) => (
          <SingleUpload key={key} {...props} />
        ))}
      </>
    );
  };
}

class RecentUploads extends React.Component {
  state = {
    recentUploads: []
  };

  componentDidMount() {
    listRecentUploads().then(data => this.setState({ recentUploads: data }));
  }
  render() {
    return (
      <>
        {this.state.recentUploads.map(upload => {
          return (
            <SingleUpload
              key={upload.preview_url}
              file={upload}
              success={true}
              preview={upload.preview_url}
            />
          );
        })}
      </>
    );
  }
}

const Uploads = () => {
  return (
    <div className="upload-container">
      <UploadContainer />
      <RecentUploads />
    </div>
  );
};

export default Uploads;
