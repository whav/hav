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


class FileBrowser extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.loadCurrentDirectory()
    }

    componentWillReceiveProps(newProps){
        if (newProps.match.url !== this.props.match.url) {
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
                selectFiles,
                buildFrontendURL,
                path,
                repository
            } = this.props;

            let uploads = this.props.uploads;
            let breadcrumbs = <DirectoryListingBreadcrumbs
                                    dirs={
                                        parentDirectories.map((d) => {
                                            return {
                                                ...d,
                                                link: buildFrontendURL(d.path)
                                            }
                                        })
                                    }
                                    current_dir={directory.name} />

            let dirListing = <DirectoryListing dirs={
                    childrenDirectories.map((d) => {
                        return {
                            ...d,
                            link: buildFrontendURL(d.path)
                        }
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
                        <UploadTrigger path={path}
                                       repository={repository}
                                       uploadTo={this.props.uploadToURL} />
                        <span className="red">{selectFiles.length}</span>
                    </DirectoryControls>
                </footer>
            </div>

        }

    }
}

FileBrowser.propTypes = {
    loading: React.PropTypes.bool.isRequired,
    // useful stuff here ...
    directory: React.PropTypes.object.isRequired,
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

        let {repository, path} = props.match.params;
        let storeKey = getStateKeyForPath(path);

        // point some variables to the correct place in the state
        let repoState = state.repositories.repositoriesByID[repository];
        let settings = state.repositories.settings;

        if(repoState === undefined) {
            return {
                loading: true,
                directory: {}
            }
        }

        // resolve directories
        let allDirs = repoState.directoriesByPath;
        let directory = allDirs[storeKey];

        const buildFrontendURL = (path) => {
                let link = `/source/${repository}/`
                if (path) {
                    link = `${link}${path}`
                }
                // console.log('Frontend URL:', path, repository, link)
                return link
        }

        let mappedProps = {
            dirPath: path,
            path,
            repository,
            buildFrontendURL
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
            files = repoState.filesByPath[storeKey];

        // get the un-finished uploads
        let _ = state.uploads[storeKey] || {},
            directoryUploads = Object.values(_).filter((ul) => !ul.finished);

        let dirPath = path || ''                                     // we don't want undefined in our urls
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
    (dispatch, props) => {
        const {repository, path} = props.match.params;
        let apiURL = `/api/v1/${repository}/`
        if (path) {
            console.log('using path...', path, Boolean(path))
            apiURL = `${apiURL}${path}/`
        }

        return {
            uploadToURL: apiURL,
            loadCurrentDirectory: () => {
                // console.log('API url built', apiURL, repository, path);
                dispatch(requestDirectoryAction(apiURL, repository, path))
            },
            navigateToDirectory: (path) => dispatch(requestDirectoryAction(path)),
            switchDisplayStyle: (style) => dispatch(switchFilebrowserDisplayType(style)),
            selectFiles: (files, modifiers={}) => {
                let filenames = files.map((f) => f.name);
                dispatch(toggleSelect(repository, path, filenames, modifiers))
            }
        }
    }
)(FileBrowser)
