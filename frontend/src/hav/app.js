import React, { Component } from 'react'
import logo from '../assets/logo.png'
import MainMenu from './menu'

// css imports
import './index.css'

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
                {this.props.children}
            </main>
        </div>
      </div>
    );
  }
}

export default App;
