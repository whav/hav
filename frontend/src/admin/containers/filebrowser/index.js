/**
 * Created by sean on 09/02/17.
 */
import React from "react";
import { connect } from "react-redux";

import { requestDirectoryAction } from "../../ducks/browser";

import LoadingIndicator from "../../ui/loading";

import { buildApiUrl } from "../../api/urls";

import DirectoryView from "./folder";
import FileView from "./detail";

class FilebrowserView extends React.Component {
  componentDidMount() {
    this.props.loadData();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.match.url !== this.props.match.url) {
      newProps.loadData();
    }
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    }
    return this.props.data.isFile ? (
      <FileView {...this.props} />
    ) : (
      <DirectoryView {...this.props} />
    );
  }
}

export default connect(
  (state, props) => {
    const key = buildApiUrl(props.location.pathname);
    const data = state.repositories[key];
    return {
      loading: data == undefined,
      data: data
    };
  },
  (dispatch, props) => {
    const apiURL = buildApiUrl(props.location.pathname);
    return {
      loadData: () => {
        dispatch(requestDirectoryAction(apiURL));
      }
    };
  }
)(FilebrowserView);
