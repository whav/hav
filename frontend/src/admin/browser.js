import React from 'react'
import LoadingIndicator from './ui/loading'
import {DirectoryListing, DirectoryListingBreadcrumbs, FileTable} from './ui/filebrowser'
import { withRouter, Link } from 'react-router-dom'

export default class FileBrowser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true
        }
        this.fetchPath = this.fetchPath.bind(this)
        this.getUrlforFilePath = this.getUrlforFilePath.bind(this)
    }

    getUrlforFilePath(fileOrDirectory={path:''}) {
        return `/incoming/${fileOrDirectory.path}`
    }

    fetchPath(path='') {
        this.setState({loading: true});
        fetch(`/api/v1/fb/${path}/`, {
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
            let {parentDirs, childrenDirs, files} = struc;
            let breadcrumbs = <DirectoryListingBreadcrumbs
                dirs={parentDirs.map((d) => { return {...d, link: this.getUrlforFilePath(d)} })}
                current_dir={struc.name} />
            let dirListing = <DirectoryListing dirs={
                    childrenDirs.map((d) => {
                        return {...d, link: this.getUrlforFilePath(d)}
                    })}/>;
            let isEmpty = (childrenDirs.length + files.length) === 0;
            return <div className="filebrowser">
                { breadcrumbs }
                <h1>{struc.name}</h1>
                <hr />
                { dirListing }
                <hr />
                <FileTable files={files} />
                { isEmpty ?
                    <h2 className="tc red">This directory is empty.</h2>
                    : null}
            </div>

        }

    }
}
