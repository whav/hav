import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { requestFile } from "../../ducks/browser";
import { FallBackImageLoader } from "../../ui/filebrowser/index";

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
      <figure>
        <FallBackImageLoader
          src={asset.preview_url}
          alt={asset.name}
          title={asset.name}
          mime_type={asset.mime}
        />
        <figcaption>{asset.name}</figcaption>
      </figure>
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
  const slice = state.repositories;
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
    loadPreview: source => {
      console.log("Loading Preview...", source);
      dispatch(requestFile(source));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviewImage);
