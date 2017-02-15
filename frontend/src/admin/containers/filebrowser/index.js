/**
 * Created by sean on 09/02/17.
 */
import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {requestDirectoryAction, switchFilebrowserDisplayType, selectFiles, toggleSelect} from '../../actions/browser'

import LoadingIndicator from '../../ui/loading'
import {DirectoryListingBreadcrumbs, DirectoryListing, FileList, fileListDisplayValues} from '../../ui/filebrowser'
import {SingleUpload} from '../../ui/filebrowser/uploads'
import {DirectoryControls, FilebrowserSettingsControl} from '../../ui/filebrowser/controls'
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
                files,
                settings,
                switchDisplayStyle,
                selectFiles
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
                    <FilebrowserSettingsControl {...settings} switchDisplayType={switchDisplayStyle}/>
                </header>
                <main>
                    { dirListing }

                    {
                        isEmpty ?
                        <h2 className="tc red">This directory is empty.</h2>
                        : <FileList files={files}
                                    displayType={settings.selectedDisplayType}
                                    handleSelect={selectFiles}
                            />
                    }
                    {
                        uploads.map((f) => <SingleUpload key={f.name} file={f}/>)
                    }

                </main>
                <footer>
                    <DirectoryControls>
                        <UploadTrigger uploadTo={this.props.dirPath} />
                        <span className="red">{selectFiles.length}</span>
                    </DirectoryControls>
                </footer>
            </div>

        }

    }
}

FileBrowser.propTypes = {
    loading: React.PropTypes.bool.isRequired,
    directory: React.PropTypes.object.isRequired,
    dirPath: React.PropTypes.string,
    loadCurrentDirectory: React.PropTypes.func.isRequired,
    navigateToDirectory: React.PropTypes.func.isRequired,
    parentDirectories: React.PropTypes.array,
    childrenDirectories: React.PropTypes.array,
    files: React.PropTypes.array,
    selectFiles: React.PropTypes.func.isRequired,
    switchDisplayStyle: React.PropTypes.func.isRequired,
    settings: React.PropTypes.object
}


export default connect(
    (state, props) => {
        let dirPath = props.match.params.path                       // this might actually be undefined
        let storeKey = getStateKeyForPath(dirPath);
        // point some variables to the correct place in the state
        let rootState = state.filebrowser;
        let allDirs = rootState.directories;
        let directory = allDirs[storeKey];
        let settings = rootState.settings;
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
            settings,
            childrenDirectories,
            parentDirectories,
            files
        }
    },
    (dispatch, props) => ({
        loadCurrentDirectory: () => {
            dispatch(requestDirectoryAction(props.match.params.path))
        },
        navigateToDirectory: (path) => dispatch(requestDirectoryAction(path)),
        switchDisplayStyle: (style) => dispatch(switchFilebrowserDisplayType(style)),
        selectFiles: (...files) => {
            let filenames = files.map((f) => f.name);
            dispatch(toggleSelect(props.match.params.path, filenames))
        }
    })
)(FileBrowser)
