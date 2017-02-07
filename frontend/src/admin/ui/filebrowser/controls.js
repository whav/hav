/**
 * Created by sean on 06/02/17.
 */
import React from 'react'

class UploadControl extends React.Component {
    render() {
        return <div>
            <h4>Here be upload!</h4>
        </div>
    }
}

class FolderControls extends React.Component {
    render() {
        return <div className="folder-controls">
            <UploadControl />
            {this.props.children}
        </div>

    }
}

export default FolderControls;
