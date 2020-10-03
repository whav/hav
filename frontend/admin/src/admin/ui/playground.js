import React from "react";
import { MultiTagField } from "../containers/autocomplete";

import { Alert, Box } from "@theme-ui/components";

class Playground extends React.Component {
  state = {
    multiselect: [],
  };

  submit = (e) => {
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
            onChange={(values) => this.setState({ multiselect: values })}
          />
          <button className="btn">Submit</button>
        </form>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>

        <hr />

        <h1>Shared UI Components</h1>
        <Alert variant="primary">Test</Alert>

        <h2>Theme UI Components</h2>
        <Box>
          <p>I am Box!</p>
        </Box>
        <button>TestMe</button>
      </div>
    );
  }
}

export default Playground;
