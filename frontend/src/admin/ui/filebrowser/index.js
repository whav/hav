/**
 * Created by sean on 03/02/17.
 */
import React from 'react'
import {Link} from 'react-router-dom'
import GoFileDirectory from 'react-icons/go/file-directory'
import GoFileMedia from 'react-icons/go/file-media'
import classNames from 'classnames'
import filesize from 'filesize'

const css = {
    // directory listing
    olDirectoryListing: 'list pl0',
    liDirectoryListing: 'di',
    dirListing: 'fb-directory-listing tc bb',
    dirListingItem: 'fb-directory-listing-item',
    // table view
    fileTable: 'dt w-100',
    fileTableItem: 'dt-row pointer dim pb4',
    fileTableItemSelected: 'bg-lightest-blue',
    fileTableItemDetail: 'dtc v-mid pa2 bb fb-table-item-detail',
    // flexbox gallery
    fileGallery: 'fb-file-gallery',
    fileGalleryItem: 'fb-file-gallery-item pa2 ba collapse',
    fileGalleryItemSelected: 'bg-lightest-blue',

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

const FileTableItem = ({file, toggleSelect}) => {
    let idCN = css.fileTableItemDetail;
    return <div className={classNames(css.fileTableItem, {[css.fileTableItemSelected]: file.selected})}
               onClick={toggleSelect}>
                <div className={classNames(idCN, 'tl')}>
                    {file.preview_url ? <img src={file.preview_url} /> : null}
                </div>
                <div className={idCN}>{file.name}</div>
                <div className={idCN}>{file.mime}</div>
                <div className={idCN}>{filesize(file.size)}</div>
            </div>
}

const FilePlaceHolder = ({className}) => {
    return <GoFileMedia className={className} />
}

const FileGalleryItem = ({file, toggleSelect}) => {
    return <div
        onClick={toggleSelect}
        className={classNames(css.fileGalleryItem, {[css.fileGalleryItemSelected]: file.selected})} >
        {file.preview_url ? <img src={file.preview_url} /> : <FilePlaceHolder /> }
        {file.name}
    </div>
}


const ImageGalleryItem = ({file, toggleSelect}) => {
    let cn = classNames('image-gallery-item', {[css.fileGalleryItemSelected]: file.selected})
    return <div className={cn} onClick={toggleSelect} title={file.name}>
        { file.preview_url ?
            <img src={encodeURI(file.preview_url)} alt={file.name}/>
            :
            <FilePlaceHolder/>}
    </div>
}

const fileListDisplayOptions = {
    'gallery': ImageGalleryItem,
    'tiles': FileGalleryItem,
    'table': FileTableItem
}

export const fileListDisplayValues = Object.keys(fileListDisplayOptions);

const FilesWrapper = ({type, ...props}) => {
    let cn = ''
    switch (type) {
        case 'table':
            cn = css.fileTable;
            break;
        default:
            cn = css.fileGallery;
    }
    return <div className={cn}>
        {props.children}
    </div>
}

export class FileList extends React.Component {

    constructor(props) {
        super(props);
        this.handleFileSelectEvent = this.handleFileSelectEvent.bind(this)
    }

    handleFileSelectEvent(file, event) {
        console.log({
            altKey: event.altKey,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
        });

        let {ctrlKey, shiftKey} = event;
        let deselectOthers = true;
        let spanSelection = false;

        if (ctrlKey || shiftKey) {
            deselectOthers = false
        }

        if (shiftKey) {
            spanSelection=true
        }

        let modifiers = {
            deselectOthers,
            spanSelection
        }

        this.props.handleSelect([file], modifiers);

    }

    render() {
        let {files, displayType, selectedFiles} = this.props;
        if (files.length === 0) {
            return null;
        }
        let Component = fileListDisplayOptions[displayType];
        let rendererFiles = files.map((file, index) => {
            let props = {
                file: file,
                toggleSelect: this.handleFileSelectEvent.bind(this, file)
            }
            return <Component key={index} {...props} />
        });

        return <FilesWrapper type={displayType}>
                {rendererFiles}
            </FilesWrapper>
    }
}

