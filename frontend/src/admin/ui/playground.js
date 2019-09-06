import React from "react";
import { MultiTagField } from "./components/autocomplete";

class Playground extends React.Component {
  state = { multiselect: [] };

  render() {
    return (
      <div className="content">
        <h1>Playground</h1>

        <h2>Multi Tag Field</h2>
        <MultiTagField
          value={this.state.multiselect}
          onChange={values => this.setState({ multiselect: values })}
        />
        <hr />

        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    );
  }
}

export default Playground;
