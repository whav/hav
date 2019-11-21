/**
 * Created by sean on 08/02/17.
 */
import { connect } from "react-redux";
import { UploadControl } from "../ui/filebrowser/controls";
import { AllUploads } from "../ui/filebrowser/uploads";

import { startFileUpload, upload_failed } from "../ducks/uploads";

const UploadTrigger = connect(
  undefined,
  (dispatch, ownProps) => ({
    uploadFiles: (accepted_files = [], rejected_files = []) => {
      let { uploadTo } = ownProps;
      accepted_files.forEach(f => dispatch(startFileUpload(f, uploadTo))),
        rejected_files.forEach((f, path) =>
          dispatch(
            upload_failed(
              path,
              f,
              "This file was rejected by the upload component.",
              0
            )
          )
        );
    }
  })
)(UploadControl);

export default UploadTrigger;

export const Uploads = connect(state => {
  let unknownUploads = [];
  let uploads = Object.entries(state.uploads)
    .map(([path, uploads]) => {
      let dirInfo = state.repositories[path];
      return {
        directory: dirInfo,
        uploads: Object.values(uploads)
      };
    })
    .filter(({ directory, uploads }) => {
      // filter out unusable entries
      if (directory == undefined) {
        unknownUploads = [...unknownUploads, ...uploads];
        return false;
      }
      return uploads.length > 0;
    });

  return {
    uploads,
    unknownUploads
  };
})(AllUploads);
