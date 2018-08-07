import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import LoadingIndicator from "../../ui/loading";

import BatchIngest from "../../ui/ingest";

import {
  fetchInitialData,
  saveIngestionData,
  updateIngestionData
} from "../../actions/ingest";

import pickBy from "lodash/pickBy";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
    };
  }

  saveData = e => {
    console.log(this.state);
    e.preventDefault();
    this.props.saveIngestionData(
      this.props.target,
      this.props.initialItems,
      this.state.name
    );
  };

  loadFormData = () => {
    this.props.fetchInitialData(this.props.initialItems, this.props.target);
  };

  render() {
    const props = this.props;
    // if (this.props.loading) {
    return (
      <form className="section" onSubmit={this.saveData}>
        <div className="container">
          <h1 className="title">New ingestion queue</h1>
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                placeholder="Name the ingestion queue"
                type="text"
                onChange={e => this.setState({ name: e.target.value })}
                value={this.state.name}
                required
              />
            </div>
          </div>

          {/* <pre>
            {JSON.stringify(
              {
                target: props.target,
                entries: this.props.initialItems
              },
              null,
              2
            )}
          </pre> */}
          <button type="submit">Save</button>
        </div>
      </form>
    );
  }
}

export default connect(
  state => {
    const { ingestTo, queue, loading, options, entries } = state.ingest;
    return {
      target: ingestTo,
      initialItems: queue,
      loading,
      options,
      entries
    };
  },
  dispatch => {
    return bindActionCreators({ saveIngestionData }, dispatch);
  }
)(Ingest);
