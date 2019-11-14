import React from "react";
import { MultiTagField, SkosmosTagField } from "../containers/autocomplete";

class Playground extends React.Component {
  state = {
    multiselect: [],
    skosmos_select: []
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
        <p>This tag field retrieves managed tags from the hav database</p>
        <form onSubmit={this.submit}>
          <MultiTagField
            value={this.state.multiselect}
            onChange={values => this.setState({ multiselect: values })}
          />
          <button>Submit</button>
        </form>

        <hr />
        <h2 className="subtitle">Skosmos Tag Field</h2>
        <p>This tag field retrieves tags from our skosmos instance.</p>
        <SkosmosTagField
          value={this.state.skosmos_select}
          onChange={values => this.setState({ skosmos_select: values })}
        />
        <hr />
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    );
  }
}

export default Playground;
