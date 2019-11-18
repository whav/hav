import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { saveIngestionData } from "../../ducks/ingest";
import uuid from "uuid/v4";

class Ingest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
    };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.focus();
    // auto fill single ingest
    if (this.props.initialItems.length === 1) {
      this.setState({ name: uuid() }, () => this.saveData());
    }
  }

  saveData = e => {
    e && e.preventDefault();
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
                ref={this.inputRef}
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
