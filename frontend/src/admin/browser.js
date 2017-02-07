import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import pathToRegexp from 'path-to-regexp'

import {DirectoryListing, DirectoryListingBreadcrumbs, FileTable} from './ui/filebrowser'
import LoadingIndicator from './ui/loading'
import DirectoryControl, {UploadControl} from './ui/filebrowser/controls'
import {Upload} from './uploader'

export default class FileBrowser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            uploads: []
        }
        this.fetchPath = this.fetchPath.bind(this)
        this.getUrlforFilePath = this.getUrlforFilePath.bind(this)
        this.handleUpload = this.handleUpload.bind(this)
        this.handleUploadDone = this.handleUploadDone.bind(this)

        // this can be used to reverse urls inside the FileBrowser
        let resolver = pathToRegexp.compile(this.props.path);
        this.buildURL = ({path}) => {
            if (typeof path === 'string') {
                if (path === '/' || path === '') {
                    path = []
                } else {
                    path = path.split('/')
                }
            }
            path = path.filter((p) => p !== "")
            console.log('Reversing url with path:', path);
            return resolver({path: path});
        }
    }

    getUrlforFilePath(fileOrDirectory={path:''}) {
        return `/incoming/${fileOrDirectory.path}`
    }


    fetchPath(path='') {
        this.setState({loading: true});
        let url = `/api/v1/fb/${path}`;
        if (!url.endsWith('/')){
            url += '/'
        }
        fetch(url, {
            credentials: 'same-origin',
        }).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.setState({
                    loading: false,
                    ...json
                })
                console.log(json.name, json)

            }
        )
    }

    handleUploadDone(data) {
        this.setState({
            files: [
                ...this.state.files,
                data
            ]
        })
    }

    handleUpload(...files) {
        let addedFiles = files.map((f) => {
            let targetURL = this.state.url + encodeURIComponent(f.name);
            console.log(targetURL);
            return {
                file: f,
                added: new Date(),
                target: targetURL,
                onUploadDone: this.handleUploadDone
            }
        })
        this.setState({
            uploads: [
                ...this.state.uploads,
                ...addedFiles
            ]
        })
    }

    componentWillReceiveProps(newProps) {
        let {match} = newProps;

        if (match.params.path != this.props.match.params.path) {
            this.fetchPath(match.params.path);
        }
    }

    componentDidMount() {
        let path = this.props.match.params.path;
        this.fetchPath(path);
    }

    render() {
        let {loading, ...struc} = this.state;
        if (loading) {
            return <LoadingIndicator />;
        } else {
            let {parentDirs, childrenDirs, files, ...ownDirProps} = struc;
            let breadcrumbs = <DirectoryListingBreadcrumbs
                                    dirs={
                                        parentDirs.map((d) => {
                                            console.log(d);
                                            return {...d, link: this.buildURL(d)}
                                        })
                                    }
                                    current_dir={ownDirProps.name} />

            let dirListing = <DirectoryListing dirs={
                    childrenDirs.map((d) => {
                        console.log(d);
                        return {...d, link: this.buildURL(d)}
                    })}/>;
            let isEmpty = (childrenDirs.length + files.length) === 0;
            return <div className="filebrowser">
                <header>
                    { breadcrumbs }
                    <h1>{struc.name}</h1>
                </header>
                <main>
                    { dirListing }

                    {
                        isEmpty ?
                        <h2 className="tc red">This directory is empty.</h2>
                        : <FileTable files={files} />
                    }
                    {
                        this.state.uploads.map((f, index) => {
                            return <Upload {...f} key={index} />
                        })
                    }
                </main>
                <footer>
                    <DirectoryControl>
                        <UploadControl uploadFiles={this.handleUpload} />
                    </DirectoryControl>
                </footer>
            </div>

        }

    }
}
