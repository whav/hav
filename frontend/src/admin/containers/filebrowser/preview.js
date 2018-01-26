import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { requestFile } from "../../actions/browser";

class PreviewImage extends React.Component {
  constructor(props) {
    super(props);
    if (!this.props.asset) {
      this.props.loadPreview(props.source);
    }
  }

  render() {
    const { asset, source, loading, imgProps = {} } = this.props;
    if (loading) {
      return null;
    }
    return (
      <img
        src={asset.preview_url}
        alt={`preview image for ${source}`}
        {...imgProps}
      />
    );
  }
}

PreviewImage.propTypes = {
  source: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  asset: PropTypes.object,
  imgProp: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
  const { source } = ownProps;
  const slice = state.repositories.browser;
  const data = slice[source];
  return data
    ? {
        asset: data,
        loading: false
      }
    : {
        loading: true
      };
};

const mapDispatchToProps = dispatch => {
  return {
    loadPreview: source => dispatch(requestFile(source))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PreviewImage);
