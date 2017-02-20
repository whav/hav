/**
 * Created by sean on 06/02/17.
 */
import React from 'react'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'

import GoCloudUpload from 'react-icons/go/cloud-upload'

class UploadControl extends React.Component {
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

const FilebrowserSettingsControl = ({selectedDisplayType, switchDisplayType, availableDisplayTypes}) => {
    return <span style={{display: 'none'}}>
        {
            availableDisplayTypes.map(
                (display_option) =>
                    <button onClick={() => switchDisplayType(display_option)}
                            className={classNames('pa1 ba mid-gray link', {'bw2 dark-gray': selectedDisplayType === display_option})}
                            key={display_option}>{display_option}</button>
                )
        }
    </span>
}

export {
    DirectoryControls,
    FilebrowserSettingsControl,
    UploadControl
}
