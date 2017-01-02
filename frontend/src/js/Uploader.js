import React, {PropTypes} from 'react';
import Dropzone from 'react-dropzone'


class Upload extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            progress: null,
            finished: false
        }
        this.updateProgress = this.updateProgress.bind(this)
        this.onTransferComplete = this.onTransferComplete.bind(this)
    }

    updateProgress(progressEvent) {
        console.log(progressEvent);
        if (progressEvent.lengthComputable) {
            var percentComplete = progressEvent.loaded / progressEvent.total;
            this.setState({progress: percentComplete});
        }
    }

    onTransferComplete() {
        this.setState({
            progress: 100,
            finished: new Date()
        })
    }

    componentDidMount() {
        // create a formdata object and attach the file to it
        // let formData = new FormData();
        // formData.append(
        //     'file',
        //     this.props.file,
        //     this.props.file.name
        // );
        let request = new XMLHttpRequest();
        request.open('POST', '/api/up/', true);
        request.withCredentials = true;
        // attach event handlers
        request.addEventListener('progress', this.updateProgress);
        request.addEventListener('load', this.onTransferComplete);
        request.send(this.props.file);
        this.request = request;
    }

    render() {
        return <p>
            {this.props.file.name} <br />
            {this.props.added.toISOString()}
            {this.state.progress}
            <br />
            { this.state.finished ? 'done' : <progress value={this.state.progress} max={100}></progress> }
        </p>
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
