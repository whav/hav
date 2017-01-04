import React from 'react'
import './index.css'

class App extends React.Component {
  render() {
    return (
      <div className="HavAdminApp">
         {this.props.children}
      </div>
    );
  }
}

export default App;
