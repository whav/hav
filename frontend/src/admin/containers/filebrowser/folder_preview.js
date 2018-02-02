import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Breadcrumbs from "../../ui/components/breadcrumbs";
import { requestDirectoryAction } from "../../actions/browser";

class PreviewFolder extends React.Component {
  constructor(props) {
    super(props);
    if (!this.props.folder) {
      this.props.loadFolder(this.props.source);
    }
  }

  render() {
    const { source, loading, folder, parent_folders = [] } = this.props;
    if (loading) {
      return null;
    }

    return <Breadcrumbs items={[...parent_folders, folder].map(f => f.name)} />;
  }
}

PreviewFolder.propTypes = {
  source: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  folder: PropTypes.object,
  parent_folders: PropTypes.array
};

const mapStateToProps = (state, ownProps) => {
  const { source } = ownProps;
  const slice = state.repositories.browser;
  const data = slice[source];
  return data
    ? {
        folder: data,
        parent_folders: (data.parents || []).map(src => slice[src]),
        loading: false
      }
    : {
        loading: true
      };
};

const mapDispatchToProps = dispatch => {
  return {
    loadFolder: source => dispatch(requestDirectoryAction(source))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewFolder);
