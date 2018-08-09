/**
 * Created by sean on 04/01/17.
 */

import { connect } from "react-redux";
import Nav from "../ui/nav";

const Navigation = connect(
  (state, props) => {
    return {
      uploads: state.uploads.length
    };
  },
  dispatch => ({})
)(Nav);

export default Navigation;
