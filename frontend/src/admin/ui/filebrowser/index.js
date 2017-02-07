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

const css = {
    olDirectoryListing: 'list pl0',
    liDirectoryListing: 'di',
    divListing: 'fb-directory-listing tc',
    divListingItem: 'fb-directory-listing-item',
    tableFileListing: 'collapse ba br2 b--black-10 pv2 ph3 mt4 tl',
    tableRow: 'pointer dim',
    tableRowSelected: 'bg-yellow',
    tableCell: 'pa2'
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
        return <div className={css.divListing}>
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
        return <div className={css.divListingItem}>
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

const FileTableItem = ({file, selected, handleSelect}) => {
    return <tr className={classNames(css.tableRow, {[css.tableRowSelected]: selected})}
               onClick={() => handleSelect(file, !selected)}>
        <td className={css.tableCell}>
            <input type="checkbox"
                   checked={selected}
                   onChange={(e) => handleSelect(file, e.target.checked)}
            />
        </td>
        <td className={css.tableCell}>{file.name}</td>
        <td className={css.tableCell}>{file.mime}</td>
        <td className={css.tableCell}>{filesize(file.stat.size)}</td>
    </tr>
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
        return <table className="w-100 pt3 collapse">
            <thead className="tl">
                <tr className={css.tableRow}>
                    <th className={css.tableCell}>
                        <input type='checkbox' onChange={(e) => e.target.checked ? this.selectAll() : this.deselectAll()} />
                    </th>
                    <th className={css.tableCell}>
                        Name
                    </th>
                    <th className={css.tableCell}>
                        Mime
                    </th>
                    <th className={css.tableCell}>
                        Size
                    </th>
                </tr>
            </thead>
            <tbody>
            {files.map((file, index) => {
                let selected = this.state.selectedFiles.includes(file);
                return <FileTableItem onClick={() => this.handleSelect(file)}
                                      file={file}
                                      selected={selected}
                                      handleSelect={this.handleSelect}
                                      key={index}
                />
            })}
            </tbody>
        </table>
    }
}

