/**
 * Created by sean on 03/02/17.
 */
import React from 'react'
import { Segment } from 'semantic-ui-react'

class Error extends React.Component {
    render() {
        return <Segment color='red'>
            { this.props.children ? this.props.children : <p>Error</p> }
        </Segment>
    }
}

export default Error