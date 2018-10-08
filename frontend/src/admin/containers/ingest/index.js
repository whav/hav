import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { saveIngestionData } from "../../ducks/ingest";
import { history } from "../../app";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
    };

    if (props.initialItems.length === 1) {
      const source = props.initialItems[0];
      let params = new URLSearchParams();
      params.append("source", source);
      params.append("target", props.target);
      history.replace(`/ingest/single/?${params.toString()}`);
    }
  }

  saveData = e => {
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
    return (
      <form className="section container" onSubmit={this.saveData}>
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
