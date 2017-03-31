/**
 * Created by sean on 06/02/17.
 */
import React from 'react'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
import {Icon, Button, Menu} from 'semantic-ui-react'

import GoCloudUpload from 'react-icons/go/cloud-upload'

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

const SelectedFilesControls = ({files}) => {
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
    return <Menu color="blue"
                 inverted
                 floated="right">
        <Menu.Item>
            {desc}
        </Menu.Item>
    </Menu>
}

const SelectionControls = ({selectAll, selectNone, invertSelection}) => {
    return <Menu floated="right">
        <Menu.Item onClick={selectAll}>
            <Icon className="check square" title="Check all" />
        </Menu.Item>
        <Menu.Item onClick={selectNone}>
            <Icon className="square" title="Uncheck all"/>
        </Menu.Item>
        <Menu.Item onClick={invertSelection} title="Invert Selection">
            <Icon className="check square" />
            ⇄
            <Icon className="square" />
        </Menu.Item>
    </Menu>
}


SelectionControls.propTypes = {
    selectAll: React.PropTypes.func.isRequired,
    selectNone: React.PropTypes.func.isRequired,
    invertSelection: React.PropTypes.func.isRequired
}

const FilebrowserSettingsControl = ({selectedDisplayType, switchDisplayType, availableDisplayTypes}) => {
    return <Menu floated='right'>
        <Menu.Item onClick={() => switchDisplayType('g-gallery')} active={selectedDisplayType === 'g-gallery'}>
            <Icon name="grid layout"/>
        </Menu.Item>
        <Menu.Item onClick={() => switchDisplayType('table')} active={selectedDisplayType === 'table'}>
            <Icon name="list layout"/>
        </Menu.Item>
    </Menu>
}

export {
    DirectoryControls,
    FilebrowserSettingsControl,
    UploadControl,
    SelectionControls,
    SelectedFilesControls
}
