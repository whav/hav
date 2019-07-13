/**
 * Created by sean on 08/02/17.
 */
import React from "react";

const SingleUpload = ({ file, success, error, progress }) => {
  return (
    <div>
      <h3>{file.name}</h3>
      {file.preview ? <img src={file.preview} alt="preview image" /> : null}
      {success ? (
        <span>Finished</span>
      ) : (
        <progress max={100} value={progress}>
          {progress}
        </progress>
      )}
      {error ? <span>Error</span> : null}
    </div>
  );
};

const AllUploads = ({ uploads }) => {
  let paths = uploads.map(({ directory, uploads }) => {
    return (
      <div key={directory.path} className="directory">
        <h2>{directory.name}</h2>
        {uploads.map(f => {
          return <SingleUpload key={f.name} file={f} />;
        })}
      </div>
    );
  });
  return <div className="allUploads">{paths}</div>;
};

export { SingleUpload, AllUploads };
