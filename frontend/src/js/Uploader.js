import React, {PropTypes} from 'react'
import Dropzone from 'react-dropzone'
import {getCSRFCookie} from './utils/xhr'

class Upload extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            uploadProgress: null,
            finished: false,
            failed: false,
            canceled: false,
            errror: false
        }
        this.onUploadProgress = this.onUploadProgress.bind(this)
        this.onTransferComplete = this.onTransferComplete.bind(this)
        this.onTransferCanceled = this.onTransferCanceled.bind(this)
        this.onTransferFailed = this.onTransferFailed.bind(this)
    }

    onUploadProgress(progressEvent) {
        if (progressEvent.lengthComputable) {
            var percentComplete = progressEvent.loaded / progressEvent.total;
            this.setState({progress: percentComplete});
        }
    }

    onTransferComplete() {
        this.setState({
            progress: 100,
            finished: new Date(),
            failed: false
        })
    }

    onTransferFailed() {
        this.setState({
            failed: false,
            progress: 0
        })
    }

    onTransferCanceled() {
        this.setState({
            canceled: true
        })
    }

    componentDidMount() {
        let csrftoken = getCSRFCookie();
        let request = new XMLHttpRequest();
        request.open('POST', '/api/v1/upload/', true);
        request.setRequestHeader(
            'Content-Disposition',
            `attachment; filename=${this.props.file.name}`
        )
        request.setRequestHeader("X-CSRFToken", csrftoken);
        request.withCredentials = true;
        // attach event handlers
        request.upload.addEventListener('progress', this.onUploadProgress);
        request.upload.addEventListener('load', this.onTransferComplete);
        request.upload.addEventListener('error', this.onTransferFailed);
        request.upload.addEventListener('abort', this.onTransferCanceled);
        request.addEventListener(
            'load',
            this.onTransferComplete
        )
        request.send(this.props.file);
        this.request = request;
    }

    render() {
        return <div>
                <p>
                    {this.props.file.name} <br />
                    {this.props.added.toISOString()}
                    {this.state.progress}
                    <br />
                    {
                        this.state.finished ?
                        'done' :
                        <progress value={this.state.progress}></progress>
                    }
                </p>,
                <pre>{JSON.stringify(this.state, null, 2)}</pre>
                <hr />
        </div>
    }
}

Upload.propTypes = {
    file: PropTypes.instanceOf(File),
    added: PropTypes.instanceOf(Date)
}

class Uploader extends React.Component {

    constructor(props) {
        super(props)
        this.onDrop = this.onDrop.bind(this)
        this.state = {
            isUploading: false,
            files: []
        }
    }

    onDrop(acceptedFiles, rejectedfiles) {
        let files = acceptedFiles.map(
            (f) => {
                return {
                    file: f,
                    added: new Date()
                }
            }
        );

        this.setState({
            files: [
                ...files,
                ...this.state.files
            ]
        })
    }

    render() {
        return <div>
            <h1>UploaderComponent</h1>
            <hr />

            <Dropzone onDrop={this.onDrop}>
                <div>
                    Try dropping some files here, or click to select files to upload.
                </div>
            </Dropzone>

            <hr />
            <div>
                {
                    this.state.files.map(
                        (file) => {
                            let key = `${file.file.name}-${file.added.toISOString()}`;
                            return <Upload {...file} key={key} />
                        }
                    )
                }
            </div>
        </div>
    }
}

export default Uploader;
