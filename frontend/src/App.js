import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-menu">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="App-main">
          <h1>Welcome to the HAV</h1>
          <p>At some point there will be some actual content here.</p>
        </div>
      </div>
    );
  }
}

export default App;
