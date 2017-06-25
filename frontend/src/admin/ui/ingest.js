import React from 'react'
import Error  from './errors'
import LoadingIndicator from './loading'
import { Breadcrumb } from 'semantic-ui-react'
import GoFileDirectory from 'react-icons/go/file-directory'

require('./ingest.css')

const IngestErrorNofiles = (props) => {
    return <Error>
      No files selected. <br /> 
      Please select some files from the available sources.
    </Error>
}

export const Directoy = (props) => {
  return <div>
    <GoFileDirectory />
    <span>{props.name}</span>
  </div>
}

export class DirectorySelector extends React.Component {

  render() {
    let { 
      parentDirs =  [],
      currentDirectory
    } = this.props;

    let breadcrumbs = [];
    let i = 0;
    parentDirs.forEach(
      (d) => {
        console.log(d)
        breadcrumbs.push(
          <Breadcrumb.Section link key={d.url} onClick={(e) => { e.preventDefault(); this.props.navigate(d.path)}}>
                {d.name}
          </Breadcrumb.Section>
        );
        i++;
        breadcrumbs.push(<Breadcrumb.Divider key={i}/>);
    });
    // add current directory to breadcrumbs
    breadcrumbs.push(
        <Breadcrumb.Section key={'urxn'} >
            {currentDirectory.name}
        </Breadcrumb.Section>
    )
    parentDirs = <Breadcrumb>{breadcrumbs}</Breadcrumb>

    return <div>
      {parentDirs}
      <hr />
      {
        this.props.loading ?
        <LoadingIndicator /> :
        <div className='directory-selector'>
          {
            this.props.directories.map(
              (d) => <div className='directory' key={d.path} >
                <a href='#' onClick={(e) => { e.preventDefault(); this.props.navigate(d.path)}}>
                  <Directoy name={d.name} />
                </a>
              </div>
            )
          }
        </div>
      }
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
        <h2>{files.length} files selected.</h2>
      } 
      {this.props.children}
    </div>
  }
}

export default IngestView
 