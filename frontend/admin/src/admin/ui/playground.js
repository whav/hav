import React from "react";
import { MultiTagField } from "../containers/autocomplete";
import { Button } from "hav-ui";
import { H1, H2 } from "hav-ui/components";
import { Alert, Box } from "@theme-ui/components";
import { from } from "zen-observable";

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
        <pre>{JSON.stringify(this.state, null, 2)}</pre>

        <hr />

        <H1>Shared UI Components</H1>
        <Alert variant="primary">Test</Alert>

        <H2>Theme UI Components</H2>
        <Box>
          <p>I am Box!</p>
        </Box>
        <Button>TestMe</Button>
      </div>
    );
  }
}

export default Playground;
