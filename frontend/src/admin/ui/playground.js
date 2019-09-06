import React from "react";
import { MultiTagField } from "./components/autocomplete";

class Playground extends React.Component {
  state = { value: "" };

  render() {
    return (
      <div className="content">
        <h2>Tag Field Test</h2>
        <MultiTagField onChange={value => this.setState({ value })} />
        <hr />

        <pre>{JSON.stringify(this.state.value, null, 2)}</pre>
      </div>
    );
  }
}

export default Playground;
