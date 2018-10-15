import React from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { connect } from "react-redux";

import requestFile from "../ducks/browser";

class WebSocketConnection extends React.PureComponent {
  constructor(props) {
    super(props);
    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
      window.location.host
    }/admin/events/media/`;
    console.warn("Websocket Mounting", url, this.props);
    this.socket = new ReconnectingWebSocket(url);
    this.socket.addEventListener("open", this.onConnect);
    this.socket.addEventListener("close", this.onClose);
    this.socket.addEventListener("message", this.onReceive);
  }

  onReceive = message => {
    console.log(JSON.parse(message.data));
  };

  onConnect = e => {
    console.log("WS connected.", e);
    // this.pinger && window.clearInterval(this.pinger);
    // this.pinger = window.setInterval(this.ping, 3000);
  };

  onClose = e => {
    console.warn("websocket closed..", e);
  };

  //   ping = () => this.socket.send(JSON.stringify({ ping: true }));

  render() {
    return null;
  }
}

export default connect(
  null,
  dispatch => ({ updateFile: url => dispatch(requestFile) })
)(WebSocketConnection);
