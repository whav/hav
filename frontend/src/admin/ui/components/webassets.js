import React from "react";

const DebugView = props => <pre>{JSON.stringify(props, null, 2)}</pre>;

const Audio = DebugView;
const Video = DebugView;
const Image = DebugView;

export { Audio, Video, Image };
