/**
 * Created by sean on 08/02/17.
 */
import React from 'react'
import {connect} from 'react-redux'
import {UploadControl} from '../ui/filebrowser/controls'
import {AllUploads} from '../ui/filebrowser/uploads'

import {getStateKeyForPath} from '../reducers/browser'

import {
    upload_started,
    upload_failed
} from '../actions/uploads'

const UploadTrigger = connect(
    undefined,
    (dispatch, ownProps) => ({
        uploadFiles: (accepted_files=[], rejected_files=[]) => {
            accepted_files.forEach((f) => dispatch(upload_started(f, ownProps.uploadTo))),
            rejected_files.forEach((f, path) => dispatch(upload_failed(f, ownProps.uploadTo, 'This file was rejected by the upload component.')))
        }
    })
)(UploadControl)

export default UploadTrigger;

export const Uploads = connect(
    (state) => {
        let unknownUploads = [];
        let uploads = Object.entries(state.uploads)
            .map(([path, uploads]) => {
                let key = getStateKeyForPath(path)
                let dirInfo = state.filebrowser[key];
                return {
                    directory: dirInfo,
                    uploads: Object.values(uploads)
                }
            }).filter(({directory, uploads}) => {
                // filter out unusable entries
                if (directory == undefined) {
                    unknownUploads = [...unknownUploads, ...uploads]
                    return false;
                }
                return uploads.length > 0
            })

        return {
            uploads,
            unknownUploads
        }
    }
)(AllUploads)
