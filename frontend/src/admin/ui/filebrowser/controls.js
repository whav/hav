/**
 * Created by sean on 06/02/17.
 */
import React from 'react'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'

import GoCloudUpload from 'react-icons/go/cloud-upload'
import MdSelectAll from  'react-icons/lib/md/select-all'
import FaCheckSquareO from 'react-icons/lib/fa/check-square-o'
import FaSquareO from 'react-icons/lib/fa/square-o'
import FaTable from 'react-icons/lib/fa/table'
import FaList from  'react-icons/lib/fa/list'

const Icon = (props) => null;
const Menu = ({children}) => <ul>{children}</ul>
Menu.Item = ({children}) => <li>{children}</li>


class UploadControl extends React.Component {
    constructor(props){
        super(props);
        this.handleDrop = this.handleDrop.bind(this)
    }
    handleDrop(acceptedFiles, rejectedFiles) {
        this.props.uploadFiles(acceptedFiles, rejectedFiles)
    }
    render() {
        return <Dropzone onDrop={this.handleDrop} className="--foo">
                <GoCloudUpload/> Add files
        </Dropzone>
    }
}

const DirectoryControls  = (props) => {
    return <Menu>
        {
            props.children.map((child, index) => child ? <Menu.Item key={index}>{child}</Menu.Item>: null)
        }
    </Menu>
}

DirectoryControls.propTypes = {
    children: React.PropTypes.array.isRequired
}

const SelectedFilesControls = ({files, save}) => {
    let length = files.length;
    if (!length) {
        return null;
    }
    let desc;
    if (length === 1) {
        desc = 'One file selected'
    } else {
        desc = `${length} files selected`
    }
    return <ul>
        <li>
            {desc}
        </li>
        <li>
            <a href='#' onClick={() => save()}>Ingest</a>
        </li>
    </ul>
}

const SelectionControls = ({selectAll, selectNone, invertSelection}) => {
    return <ul>
        <li onClick={selectAll}>
            <FaCheckSquareO title="Check all" />
        </li>
        <li onClick={selectNone}>
            <FaSquareO title="Uncheck all"/>
        </li>
        <li onClick={invertSelection} title="Invert Selection">
            <FaCheckSquareO />
            ⇄
            <FaSquareO />
        </li>
    </ul>
}


SelectionControls.propTypes = {
    selectAll: React.PropTypes.func.isRequired,
    selectNone: React.PropTypes.func.isRequired,
    invertSelection: React.PropTypes.func.isRequired
}

const FilebrowserSettingsControl = ({selectedDisplayType, switchDisplayType, availableDisplayTypes}) => {
    return <ul>
        <li onClick={() => switchDisplayType('g-gallery')} className={classNames({active: selectedDisplayType === 'g-gallery'})}>
            <FaTable />
        </li>
        <li onClick={() => switchDisplayType('table')} className={classNames({active: selectedDisplayType === 'table'})}>
            <FaList />
        </li>
    </ul>
}

export {
    DirectoryControls,
    FilebrowserSettingsControl,
    UploadControl,
    SelectionControls,
    SelectedFilesControls
}
