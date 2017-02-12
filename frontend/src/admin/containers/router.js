/**
 * Created by sean on 09/02/17.
 */
import React from 'react'
import {withRouter, Route} from 'react-router-dom'
import {connect} from 'react-redux'

import {route_changed} from '../actions/router'

const RouteActionTrigger = (props) => {
    props.route_callback(props.match);
    return null;
}

const ReactRoute = (props) => {
    return <Route component={RouteActionTrigger} {...props}/>
}


const RouterState = connect(
    (state) => ({}),
    (dispatch) => ({
        route_callback: (match) => dispatch(route_changed(match))
    })
)(ReactRoute)

export default RouterState

