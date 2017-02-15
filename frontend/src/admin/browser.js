import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import pathToRegexp from 'path-to-regexp'

import {DirectoryListing, DirectoryListingBreadcrumbs, FileTable} from './ui/filebrowser'
import LoadingIndicator from './ui/loading'
import DirectoryControl from './ui/filebrowser/controls'
import Uploader from './containers/uploads'

export default class FileBrowser extends React.Component {
    constructor(props) {
        super(props)

        this.getUrlforFilePath = this.getUrlforFilePath.bind(this)

        // this can be used to reverse urls inside the FileBrowser
        const resolver = pathToRegexp.compile(this.props.path);
        this.buildURL = ({path}) => {
            if (typeof path === 'string') {
                if (path === '/' || path === '') {
                    path = []
                } else {
                    path = path.split('/')
                }
            }
            path = path.filter((p) => p !== "")
            return resolver({path: path});
        }
    }

    getUrlforFilePath(fileOrDirectory={path:''}) {
        return `/incoming/${fileOrDirectory.path}`
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
                        <Uploader uploadTo={this.props.match.params.path} />
                    </DirectoryControl>
                </footer>
            </div>

        }

    }
}
