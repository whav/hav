/**
 * Created by sean on 03/02/17.
 */
import React from 'react'
import {Link} from 'react-router-dom'
import GoFileDirectory from 'react-icons/go/file-directory'
import GoFileMedia from 'react-icons/go/file-media'
import GoChevronRight from 'react-icons/go/chevron-right'
import classNames from 'classnames'
import filesize from 'filesize'
import pathToRegexp from 'path-to-regexp'

import LoadingIndicator from '../loading'
import DirectoryControl from './controls'
import Uploader from '../../containers/uploads'

const css = {
    olDirectoryListing: 'list pl0',
    liDirectoryListing: 'di',
    dirListing: 'fb-directory-listing tc bb',
    dirListingItem: 'fb-directory-listing-item',
    fileList: 'dt w-100',
    fileListItem: 'dt-row pointer dim pb4',
    fileListItemSelected: 'bg-yellow',
    fileListItemDetail: 'dtc v-mid pa2 bb'
}

require('./index.css')

export class DirectoryListingBreadcrumbs extends React.Component {
    render() {
        let {dirs} = this.props
        return <div className='f6'>
            <ol className="list pl0 di">
                {dirs.map((d, index) => {
                    return <li className="di" key={index}>
                        <Link to={d.link} className="link">
                            {
                                index === 0 ?
                                <span>
                                    <GoFileDirectory />
                                    <span className="pl1">Root</span>
                                </span>:
                                <span>
                                    <span className="pl1 pr1">/</span>
                                    <span>{d.name}</span>
                                </span>
                            }
                        </Link>
                    </li>
                })}
            </ol>
        </div>
    }
}

export class DirectoryListing extends React.Component {
    render() {
        let {dirs} = this.props;
        if (dirs.length === 0) return null;
        return <div className={css.dirListing}>
            {
                dirs.map((dir, index) => {
                    return <Directory key={index} {...dir} />
                })
            }
        </div>
    }
}

export class Directory extends React.Component {
    render() {
        let {name, link} = this.props;
        return <div className={css.dirListingItem}>
            <Link to={link} className="pa1 link black bg-animate hover-bg-yellow db h-100">
                <GoFileDirectory className="f1"/>
                <br />
                <span>{name}</span>
            </Link>
        </div>
    }
}

export class File extends React.Component {
    render() {
        let {name} = this.props;
        return <div className="pl1 link black tc">
            <GoFileMedia/>
            {name}
        </div>
    }
}

const FileItem = ({file, selected, handleSelect}) => {
    return <div className={classNames(css.fileListItem, {[css.fileListItemSelected]: selected})}
               onClick={() => handleSelect(file, !selected)}>
        <div className={css.fileListItemDetail}>
            <input type="checkbox"
                   checked={selected}
                   onChange={(e) => handleSelect(file, e.target.checked)}
            />
        </div>
        <div className={css.fileListItemDetail}>
            {/*className='db w4'*/}
            {file.preview_url ? <img src={file.preview_url} /> : null}
        </div>
        <div className={css.fileListItemDetail}>{file.name}</div>
        <div className={css.fileListItemDetail}>{file.mime}</div>
        <div className={css.fileListItemDetail}>{filesize(file.stat.size)}</div>
    </div>
}

export class FileTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: []
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.deselectAll = this.selectAll.bind(this, false);
    }

    selectAll(select=true){

        if (select) {
            this.setState({
                selectedFiles: [...this.props.files]
            })
        } else {
            this.setState({
                selectedFiles: []
            })
        }
    }

    handleSelect(file, isSelected){
        if (isSelected) {
            this.setState(
                (prevState) => {
                    if (!prevState.selectedFiles.includes(file)){
                        return {
                            selectedFiles: [
                                ...prevState.selectedFiles,
                                file
                            ]
                        }
                    }
                }
            )
        } else {
            this.setState((prevState) => {
                let selected = prevState.selectedFiles;
                let index =  selected.indexOf(file);
                if (index >= 0) {
                    return {
                        selectedFiles: [
                            ...selected.slice(0, index),
                            ...selected.slice(index + 1)
                        ]
                    }
                }
            })
        }
    }
    render() {
        let {files} = this.props;
        if (files.length === 0) {
            return null;
        }
        return <div className={css.fileList}>
            {files.map(
                (file, index) => {
                    let selected = this.state.selectedFiles.includes(file);
                    return <FileItem onClick={() => this.handleSelect(file)}
                                      file={file}
                                      selected={selected}
                                      handleSelect={this.handleSelect}
                                      key={index}
                    />
                })
            }
        </div>
    }
}

