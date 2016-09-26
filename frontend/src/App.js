import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import MainMenu from './Menu'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-menu">
          <img src={logo} className="App-logo" alt="logo" />
          <MainMenu />
        </div>
        <div className="App-main">
            <main>
                <h1>Welcome to the HAV</h1>
                <p>At some point there will be some actual content here.</p>
            </main>
        </div>
      </div>
    );
  }
}

export default App;
