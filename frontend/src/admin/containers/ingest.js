import React from 'react'
import {connect} from 'react-redux'


class QueueSelection extends React.Component {
    render() {
        return <div>
            <h1>Queues</h1>
            <pre>{JSON.stringify(this.props.files, null, 2)}</pre>
        </div>
    }
}

export default connect(
    (state, ownProps) => {
        return {
            files: ownProps.location.state || []
        }
    }
)(QueueSelection)