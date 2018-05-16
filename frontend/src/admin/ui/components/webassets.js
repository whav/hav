import React from "react";

const Audio = ({ url }) => <audio controls src={url} />;
const Video = ({ url }) => <video controls src={url} />;
const Image = ({ url }) => <img src={url} alt="webasset" />;

export { Audio, Video, Image };
