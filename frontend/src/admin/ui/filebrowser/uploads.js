/**
 * Created by sean on 08/02/17.
 */
import React from 'react'

const SingleUpload = ({file}) => {
    return <div>
        <h3>{file.name}</h3>
        { file.finished ?
            <span>Finished</span> :
            <progress max={100} value={file.progress} className="tc tb">{file.progress}</progress>}
    </div>
}

const AllUploads = ({uploads}) => {
    let paths = uploads.map(({directory, uploads}) => {
        return (
            <div key={directory.path} className="directory">
                <h2>{directory.name}</h2>
                {
                    uploads.map((f) =>{
                        return <SingleUpload key={f.name} file={f}/>
                    })
                }
            </div>
        )
    })
    return <div className="allUploads">{paths}</div>;
}

export {
    SingleUpload,
    AllUploads
};