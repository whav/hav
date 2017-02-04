/**
 * Created by sean on 03/02/17.
 */
import React from 'react'

class Error extends React.Component {
    render() {
        return <div className="error">
            { this.props.children ? this.props.children : <p>Error</p> }
        </div>
    }
}