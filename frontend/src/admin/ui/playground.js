import React from "react";
import { MultiTagField } from "../containers/autocomplete";

class Playground extends React.Component {
  state = {
    multiselect: []
  };

  submit = e => {
    e.preventDefault();
    console.log(JSON.stringify(this.state, null, 2));
  };

  render() {
    return (
      <div className="hav-content">
        <h1 className="title">Playground</h1>

        <h2 className="subtitle">Multi Tag Field</h2>
        <p>This tag field retrieves Tags from the HAV database</p>
        <form onSubmit={this.submit}>
          <MultiTagField
            value={this.state.multiselect}
            onChange={values => this.setState({ multiselect: values })}
          />
          <button className="btn">Submit</button>
        </form>
        <hr />
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    );
  }
}

export default Playground;
