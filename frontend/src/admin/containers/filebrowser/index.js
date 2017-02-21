/**
 * Created by sean on 09/02/17.
 */
import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import pathToRegexp from 'path-to-regexp'

import {requestDirectoryAction, switchFilebrowserDisplayType, toggleSelect} from '../../actions/browser'
import LoadingIndicator from '../../ui/loading'
import {DirectoryListingBreadcrumbs, DirectoryListing, FileList, fileListDisplayValues} from '../../ui/filebrowser'
import {SingleUpload} from '../../ui/filebrowser/uploads'
import {DirectoryControls, FilebrowserSettingsControl} from '../../ui/filebrowser/controls'
import UploadTrigger from '../uploads'

import {getDirectoryForPath, getFilesForPath, stripSlashes} from '../../reducers/browser'

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
                allowUpload=false
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

            // spice up the directories
            let directories = childrenDirectories.map((d) => {
                return {
                    ...d,
                    navigate: () => {this.props.push(buildFrontendURL(d.path))}
                }
            })

            let isEmpty = (childrenDirectories.length + files.length + uploads.length) === 0;

            return <div className="filebrowser">
                <header>
                    { breadcrumbs }
                    <h1>{directory.name}</h1>
                    <FilebrowserSettingsControl {...settings} switchDisplayType={switchDisplayStyle}/>
                </header>
                <main>
                    {
                        isEmpty ?
                        <h2 className="tc red">This directory is empty.</h2>
                        : <FileList directories={directories}
                                    files={files}
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
                        {
                            allowUpload ?
                            <UploadTrigger path={path}
                                           uploadTo={this.props.uploadToURL} />
                            : null
                        }

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
    parentDirectories: React.PropTypes.array,
    childrenDirectories: React.PropTypes.array,
    files: React.PropTypes.array,
    selectFiles: React.PropTypes.func.isRequired,
    switchDisplayStyle: React.PropTypes.func.isRequired,
    settings: React.PropTypes.object,
    allowUpload: React.PropTypes.bool
}


export default connect(

    (rootState, props) => {

        // the location of the root state is defined
        // in the root reducer
        const state = rootState.repositories;
        const settings = state.settings;
        const path = props.match.params;

        // construct a helper function to build frontend urls
        const reverseURL = pathToRegexp.compile(props.match.path)
        const buildFrontendURL = (p) => {
            p = stripSlashes(p)
            return reverseURL({
                repository: path.repository,
                path: p ? p : undefined
            })
        }

        let directory = getDirectoryForPath(path, state)

        let mappedProps = {
            directory,
            path,
            buildFrontendURL
        }

        if ((directory === undefined) || !directory.lastLoaded) {
            return {
                ...mappedProps,
                loading: true,
                directory: {}
            }
        }

        // populate parent, children and files from state
        let parentDirectories = directory.parents.map((key) => getDirectoryForPath(key, state)),
            childrenDirectories = directory.children.map((key) => getDirectoryForPath(key, state)),
            files = getFilesForPath(path, state);

        // get the un-finished uploads
        let _ = state.uploads || {},
            directoryUploads = Object.values(_).filter((ul) => !ul.finished);

        return {
            ...mappedProps,
            loading: false,
            directory,
            uploads: directoryUploads,
            settings,
            childrenDirectories,
            parentDirectories,
            files,
            allowUpload: directory.allowUpload || false
        }
    },
    (dispatch, props) => {
        let path = {...props.match.params};
        let apiURL = `/api/v1/${path.repository}/`
        if (path.path) {
            apiURL = `${apiURL}${path.path}/`
        }
        return {
            uploadToURL: apiURL,
            loadCurrentDirectory: () => {
                dispatch(requestDirectoryAction(path, apiURL))
            },
            switchDisplayStyle: (style) => dispatch(switchFilebrowserDisplayType(style)),
            selectFiles: (files, modifiers={}) => {
                let filenames = files.map((f) => f.name);
                dispatch(toggleSelect(path, filenames, modifiers))
            }
        }
    }
)(FileBrowser)
