/**
 * Created by sean on 09/02/17.
 */
import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {requestDirectoryAction} from '../../actions/browser'

import LoadingIndicator from '../../ui/loading'
import {DirectoryListingBreadcrumbs, DirectoryListing, FileTable} from '../../ui/filebrowser'
import {SingleUpload} from '../../ui/filebrowser/uploads'
import DirectoryControl from '../../ui/filebrowser/controls'
import UploadTrigger from '../uploads'
import {getStateKeyForPath} from '../../reducers/browser'

const buildClientURL = (path) => {
    if (path.endsWith('/')) { path = path.slice(0, -1)}
    if (path !== '') {
        path = `/incoming/${path}/`
    } else {
        path = '/incoming/'
    }
    return path
}

class FileBrowser extends React.Component {

    constructor(props) {
        super(props)
    }
    componentDidMount() {
        this.props.loadCurrentDirectory()
    }

    componentWillReceiveProps(newProps){
        if (newProps.dirPath !== this.props.dirPath) {
            newProps.loadCurrentDirectory()
        }
    }
    render() {
        if (this.props.loading) {
            return <LoadingIndicator />;
        } else {
            let {
                directory,
                parentDirectories,
                childrenDirectories,
                files
            } = this.props;

            let uploads = this.props.uploads;
            let breadcrumbs = <DirectoryListingBreadcrumbs
                                    dirs={
                                        parentDirectories.map((d) => {
                                            return {...d, link: buildClientURL(d.path)}
                                        })
                                    }
                                    current_dir={directory.name} />

            let dirListing = <DirectoryListing dirs={
                    childrenDirectories.map((d) => {
                        return {...d, link: buildClientURL(d.path)}
                    })}/>;

            let isEmpty = (childrenDirectories.length + files.length + uploads.length) === 0;

            return <div className="filebrowser">
                <header>
                    { breadcrumbs }
                    <h1>{directory.name}</h1>
                </header>
                <main>
                    { dirListing }

                    {
                        isEmpty ?
                        <h2 className="tc red">This directory is empty.</h2>
                        : <FileTable files={files} />
                    }
                    {
                        uploads.map((f) => <SingleUpload key={f.name} file={f}/>)
                    }

                </main>
                <footer>
                    <DirectoryControl>
                        <UploadTrigger uploadTo={this.props.dirPath} />
                    </DirectoryControl>
                </footer>
            </div>

        }

    }
}

FileBrowser.propTypes = {
    // childrenDirs: React.PropTypes.array.isRequired,
    // parentDirs: React.PropTypes.array.isRequired,
    // files: React.PropTypes.array.isRequired,
    directory: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
    dirPath: React.PropTypes.string,
    loadCurrentDirectory: React.PropTypes.func.isRequired,
    navigateToDirectory: React.PropTypes.func.isRequired,
    parentDirectories: React.PropTypes.array,
    childrenDirectories: React.PropTypes.array,
    files: React.PropTypes.array
}


export default connect(
    (state, props) => {
        let dirPath = props.match.params.path                       // this might actually be undefined
        let storeKey = getStateKeyForPath(dirPath);
        // point some variables to the correct place in the state
        let rootState = state.filebrowser;
        let allDirs = rootState.directories;
        let directory = allDirs[storeKey];
        let mappedProps = {
            dirPath,
        }
        if ((directory === undefined) || !directory.lastLoaded) {
            return {
                ...mappedProps,
                loading: true,
                directory: {}
            }
        }

        let parentDirectories = directory.parents.map((key) => allDirs[key]),
            childrenDirectories = directory.children.map((key) => allDirs[key]),
            files = rootState.files[storeKey];

        // get the un-finished uploads
        let _ = state.uploads[storeKey] || {},
            directoryUploads = Object.values(_).filter((ul) => !ul.finished);

        dirPath = dirPath || ''                                     // we don't want undefined in our urls
        return {
            ...mappedProps,
            dirPath,
            loading: false,
            directory: directory,
            uploads: directoryUploads,
            childrenDirectories,
            parentDirectories,
            files
        }
    },
    (dispatch, props) => ({
        loadCurrentDirectory: () => {
            dispatch(requestDirectoryAction(props.match.params.path))
        },
        navigateToDirectory: (path) => dispatch(requestDirectoryAction(path))
    })
)(FileBrowser)
