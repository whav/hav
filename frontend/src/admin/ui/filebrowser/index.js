/**
 * Created by sean on 03/02/17.
 */
import React from 'react'
import {Link} from 'react-router-dom'
import GoFileDirectory from 'react-icons/go/file-directory'
import GoFileMedia from 'react-icons/go/file-media'
import GoChevronRight from 'react-icons/go/chevron-right'
import filesize from 'filesize'

const css = {
    olDirectoryListing: 'list pl0',
    liDirectoryListing: 'di',
    divListing: 'fb-directory-listing tc',
    divListingItem: 'fb-directory-listing-item',
    tableFileListing: 'collapse ba br2 b--black-10 pv2 ph3 mt4'
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

const FileTableItem = ({file}) => {
    return <tr>
        <td>{file.name}</td>
        <td>{filesize(file.size)}</td>
    </tr>
}

export class FileTable extends React.Component {
    render() {
        let {files} = this.props;
        return <table>
            <tbody>
            {files.map((file, index) => <FileTableItem file={file} key={index}/>)}
            </tbody>
        </table>
    }
}