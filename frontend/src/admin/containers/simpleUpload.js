import React from "react";
import upload from "../api/upload";
import { UploadControl } from "../ui/filebrowser/controls";
import { Upload } from "../ui/filebrowser/uploads";
import { file_upload } from "../api/urls";
import uuid from "uuid/v4";

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
          ...state.uploads,
          [key]: {
            file,
            progress: 0,
            success: false,
            error: false
          }
        }
      };
    });

    // build progress functions
    const update = s => this.setUploadState(key, s);
    const onProgress = p => update({ progress: p });
    const onSuccess = resp => update({ success: true, error: false });
    const onError = () => update({ error: true, success: false });

    // finally start the upload
    upload(file, file_upload, onSuccess, onProgress, onError);
  };

  render = () => {
    return (
      <div>
        {Object.entries(this.state.uploads).map(([key, props]) => (
          <Upload key={key} {...props} />
        ))}
        <UploadControl uploadFile={this.uploadFile} />
      </div>
    );
  };
}

export default UploadContainer;
