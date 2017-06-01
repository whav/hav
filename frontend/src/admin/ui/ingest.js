import React from 'react'
import Error  from './errors'
import LoadingIndicator from './loading'

const IngestErrorNofiles = (props) => {
    return <Error>
      No files selected. <br /> 
      Please select some files from the available sources.
    </Error>
}

export class DirectorySelector extends React.Component {

  render() {
    let parentLinks = null;
    let directory = this.props.currentDirectory;
    if (directory.parents) {
      parentLinks = directory.parents.map(
        (d) => (<li key={d.path} >
                <a href='#' onClick={(e) => { e.preventDefault(); this.props.navigate(d.path)}}>
                  {d.name}
                </a>
          </li>)
      )
      parentLinks = <ul>{parentLinks}</ul>
    } 

    return <div>
      <h1>Directories</h1>
      {parentLinks}
      {
        this.props.loading ?
        <LoadingIndicator /> :
        <ul>
          {
            this.props.directories.map(
              (d) => <li key={d.path} >
                <a href='#' onClick={(e) => { e.preventDefault(); this.props.navigate(d.path)}}>
                  {d.name}
                </a>
              </li>
            )
          }
        </ul>
      }

      <hr />
      <pre>{JSON.stringify(this.props, null, 2)}</pre>
    </div>
  }
}

class IngestView extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    let files = this.props.files;
    return <div>
      <h1>Ingest</h1>
      {
        files.length === 0 ?
        <IngestErrorNofiles /> :
        <h2>Here be selection. {files.length} files selected </h2>
      } 
      {this.props.children}
    </div>
  }
}

export default IngestView
 