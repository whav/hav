/**
 * Created by sean on 06/02/17.
 */
import React from 'react'
import Dropzone from 'react-dropzone'

import GoCloudUpload from 'react-icons/go/cloud-upload'

export class UploadControl extends React.Component {
    constructor(props){
        super(props);
        this.handleDrop = this.handleDrop.bind(this)
    }
    handleDrop(acceptedFiles, rejectedFiles) {
        this.props.uploadFiles(acceptedFiles, rejectedFiles)
    }
    render() {
        return <Dropzone onDrop={this.handleDrop}
                         className="f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa3 ba border-box mr4">
                <GoCloudUpload/>
                <span className="pl1">Add new files</span>
            </Dropzone>
    }
}

class DirectoryControls extends React.Component {
    render() {
        return <div className="folder-controls">
            {this.props.children}
        </div>
    }
}


export default DirectoryControls;
