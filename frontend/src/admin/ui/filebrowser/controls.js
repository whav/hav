import PropTypes from 'prop-types';
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

import { Button, Menu } from 'semantic-ui-react'


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
    children: PropTypes.array.isRequired
}

const SelectedFilesControls = ({files, save}) => {
    let length = files.length;
    if (!length) {
        return null;
    }
    let desc;
    if (length === 1) {
        desc = '1 file'
    } else {
        desc = `${length} files`
    }
    return <Button
      content='Ingest'
      primary
      label={{ as: 'a', basic: true, content: desc }}
      labelPosition='left'
      onClick={() => save()}
    />
}

const SelectionControls = ({selectAll, selectNone, invertSelection}) => {
    return <Button.Group>
        <Button onClick={selectAll} basic icon active={false}>
            <FaCheckSquareO title="Check all" />
        </Button>
        <Button onClick={selectNone} active={false} icon basic>
            <FaSquareO title="Uncheck all"/>
        </Button >
        <Button onClick={invertSelection} icon title="Invert Selection" active={false} basic>
            <FaCheckSquareO />
            ⇄
            <FaSquareO />
        </Button>
    </Button.Group>
}


SelectionControls.propTypes = {
    selectAll: PropTypes.func.isRequired,
    selectNone: PropTypes.func.isRequired,
    invertSelection: PropTypes.func.isRequired
}


const FilebrowserViewControl = ({selectedDisplayType, switchDisplayType}) => {
    return <Button.Group>
        <Button basic onClick={() => switchDisplayType('g-gallery')} 
                className={classNames({active: selectedDisplayType === 'g-gallery'})}>
            <FaTable />
        </Button>
        <Button basic onClick={() => switchDisplayType('table')} 
                className={classNames({active: selectedDisplayType === 'table'})}>
            <FaList />
        </Button>
    </Button.Group>
}

const FileBrowserMenu = (props) => {
    return <Menu borderless secondary>
        {props.name ? <Menu.Item header>{props.name}</Menu.Item> : null}
        <Menu.Item>
            <FilebrowserViewControl switchDisplayType={props.switchDisplayType} selectedDisplayType={props.selectedDisplayType}/>
        </Menu.Item>
        <Menu.Item>
            <SelectionControls selectAll={props.selectAll}
                            selectNone={props.selectNone}
                            invertSelection={props.invertSelection}
            />
        </Menu.Item>
        <Menu.Menu position='right'>
            <Menu.Item>
                <SelectedFilesControls files={props.files} save={() => props.saveFileSelection(props.files)} />
            </Menu.Item>
        </Menu.Menu>
                                        
    </Menu>
}

export {
    DirectoryControls,
    FilebrowserViewControl,
    UploadControl,
    FileBrowserMenu
}
