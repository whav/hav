import PropTypes from 'prop-types';
/**
 * Created by sean on 03/02/17.
 */
import React from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import filesize from 'filesize'

import GoFileDirectory from 'react-icons/go/file-directory'
import GoFileMedia from 'react-icons/go/file-media'
import GoCheck from 'react-icons/go/check'
import GoHourglass from 'react-icons/go/hourglass'
import FaFileImageO from 'react-icons/fa/file-image-o'
import FaFileMovieO from 'react-icons/fa/file-movie-o'
import FaFileAudioO from 'react-icons/fa/file-audio-o'
import FaChainBroken from 'react-icons/fa/chain-broken'

const css = {
    // directory listing
    olDirectoryListing: '',
    liDirectoryListing: '',
    dirListing: 'fb-directory-listing',
    dirListingItem: 'fb-directory-listing-item',
    // table view
    fileTable: '',
    fileTableItem: '',
    fileTableItemSelected: '',
    fileTableItemDetail: 'fb-table-item-detail',
    // flexbox gallery
    fileGallery: 'fb-file-gallery',
    fileGalleryItem: 'fb-file-gallery-item',
    fileGalleryItemSelected: '',

}

require('./index.css')

export class DirectoryListingBreadcrumbs extends React.Component {
    render() {
        let {dirs} = this.props;
        let crumbs = [];
        dirs.forEach((d, index) => {
            crumbs.push(<li key={index}>
                <Link to={d.link}>{d.name}</Link>
            </li>)
            crumbs.push(<li className="divider" key={(index + 1) * -1}> / </li>)
        });
        return <ul className="breadcrumbs">
            {crumbs}
        </ul>
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

const FilePlaceHolder = ({mime, className}) => {
    let Icon = GoFileMedia
    if (mime) {
        let category = mime.split('/')[0];
        switch (category) {
            case 'video':
                Icon = FaFileMovieO
                break;
            case 'image':
                Icon = FaFileImageO
                break
            case 'audio':
                Icon = FaFileAudioO
                break
            default:
                break
        }
    }
    return <Icon title={mime || ''} className={className} />
}

const FileGalleryItem = ({file, toggleSelect}) => {
    return <div
        onClick={toggleSelect}
        className={classNames(css.fileGalleryItem, {[css.fileGalleryItemSelected]: file.selected})} >
        {file.preview_url ? <img src={file.preview_url} /> : <FilePlaceHolder mime={file.mime} /> }
        {file.name}
    </div>
}

class ImageGalleryItem extends React.Component {
    constructor(props) {
        super(props);
        this.loadCalled = false;
        this.handleImageLoad = this.handleImageLoad.bind(this)
    }

    handleImageLoad(img) {
        // return immediately if load called before
        if (this.loadCalled) {return}
        if (img.naturalHeight === 0 || img.naturalWidth === 0) {
            return
        }
        this.setState({
            ratio: img.naturalWidth / img.naturalHeight,
            width: img.naturalWidth,
            height: img.naturalHeight
        })
        this.loadCalled = true;
    }
    render() {
        let {file, toggleSelect} = this.props;
        let cn = classNames(
            'image-gallery-item',
            {
                [css.fileGalleryItemSelected]: file.selected,
                'no-preview': !file.preview_url
            }
        );

        // this being stolen from
        // https://github.com/xieranmaya/blog/issues/6
        let divStyle = {};
        let iStyle = {};
        if (this.loadCalled) {
            let {height, width} = this.state;
            let wtf =  width * 200 / height;
            divStyle = {
                flexGrow: wtf,
                width: wtf + 'px'
            }
            iStyle = {
                paddingBottom: height / width*100 + '%'
            }
        }
        return <div className={cn} onClick={toggleSelect} style={divStyle} title={file.name}>
            <i style={iStyle} />
            { file.preview_url ?
                <img onLoad={(e) => this.handleImageLoad(e.target)}
                     src={encodeURI(file.preview_url)}
                     alt={file.name} />
                :
                <FilePlaceHolder className='gallery-item-file'/>}
                { file.selected ?
                    <span className="image-gallery-selected">
                        <GoCheck className="green"/>
                    </span>
                    : null }
        </div>
    }
}

class ImageGallery extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let { files, toggleSelect} = this.props;
        let children = files.map(
            (file, index) => {
                return <ImageGalleryItem key={index}
                                         file={file}
                                         toggleSelect={(e) => toggleSelect(file, e)} />
            })
        return <div className="image-gallery">
            {children}
        </div>
    }

}

export class FallBackImageLoader extends React.Component {
    constructor(props) {
        super(props)
        this.handleImageLoadError = this.handleImageLoadError.bind(this)
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.state = {
            hasError: false,
            hasLoaded: false
        }
    }
    handleImageLoadError(e) {
        this.setState({
            hasError: true
        })
    }

    handleImageLoad(e) {
        this.setState({
            hasLoaded: true
        })
    }
    render() {
        let {src, alt='image', title='', fallbackImage=FaChainBroken} = this.props;
        let {hasError} = this.state;
        if (hasError) {
            let FallBackImage = fallbackImage;
            return <FallBackImage />
        }
        return <img src={src}
                    onError={this.handleImageLoadError}
                    title={title}
                    alt={alt} />

    }
}

FallBackImageLoader.propTypes = {
    src: PropTypes.string.isRequired
}

const GGalleryItem = ({name, preview, directory=false, selected=false, onClick}) => {
        return <div className={
                    classNames(
                        "g-gallery-item",
                        {
                            "selected": selected,
                            "g-gallery-item-file": !directory,
                            "g-gallery-directory": directory
                        }
                    )
                }
                onClick={onClick}>
        <span className={classNames("g-gallery-select", {'green': selected})} >
            <GoCheck />
        </span>
        {/*<div className='preview'>*/}
            {preview}
        {/*</div>*/}

        <div className="g-gallery-item-name">
            {name}
        </div>
    </div>
}

export const GGalleryDirectory = ({name, navigate}) => {
    return <GGalleryItem 
        name={name}
        onClick={navigate}
        directory={true}
        preview={<GoFileDirectory />}
        selected={false}
    />
}

export const GGalleryFile =({file, toggleSelect}) => {

    let preview = file.preview_url ?
        <FallBackImageLoader src={file.preview_url}
                            title={`${file.name} ${file.mime}`}
                            alt="preview image" />
        :
        <FilePlaceHolder mime={file.mime}/>;

    return <GGalleryItem
        onClick={toggleSelect}
        name={file.name}
        preview={preview}
        selected={file.selected}
    />
}

const GGalleryUpload = ({upload}) => {
    return <div className={classNames('g-gallery-item')}>
        <div className="g-gallery-item-preview">
            {
                upload.preview ?
                <FallBackImageLoader src={upload.preview} fallbackImage={GoHourglass} />:
                null
            }
        </div>
        <div className="g-gallery-item-name">
            <progress max={100} value={upload.progress}>
                            {upload.file}
            </progress>
            <span>{upload.name}</span>
        </div>
    </div>;
}

// group all our display options for selection
const fileListDisplayOptions = {
    'g-gallery': GGalleryFile,
    'gallery': ImageGalleryItem,
    'tiles': FileGalleryItem,
    'table': FileTableItem,
}

export const fileListDisplayValues = Object.keys(fileListDisplayOptions);

const FilesWrapper = ({type, ...props}) => {
    let cn = ''
    switch (type) {
        case 'table':
            cn = 'file-table';
            break;
        case 'gallery':
            cn = 'image-gallery'
            break;
        case 'ggallery':
            cn = 'g-gallery'
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
        let {directories=[], files=[], uploads=[], displayType} = this.props;

        if ((files.length + directories.length) === 0) {
            return null;
        }
        let Component = fileListDisplayOptions[displayType];
        console.log(displayType);
        if (displayType === 'gallery') {
            return <ImageGallery toggleSelect={this.handleFileSelectEvent}
                                 files={files}
            />
        } else {

            let renderedDirectories = directories.map((directory, index) => {
                return <GGalleryDirectory {...directory} key={index} />
            })

            let rendererFiles = files.map((file, index) => {
                let props = {
                    file: file,
                    toggleSelect: this.handleFileSelectEvent.bind(this, file)
                    }
                    return <Component key={index} {...props} />
            });

            let renderedUploads = Object.values(uploads).map((upload, index) => {
                return <GGalleryUpload upload={upload} key={index}/>
            })

            return <FilesWrapper type={displayType}>
                {renderedDirectories}
                {rendererFiles}
                {renderedUploads}
            </FilesWrapper>
        }

    }
}


