import React from "react";

const Audio = ({ url, poster }) => <audio controls src={url} />;
const Video = ({ url, poster }) => <video controls src={url} poster={poster} />;
const Image = ({ url }) => <img src={url} alt="webasset" />;

export { Audio, Video, Image };
