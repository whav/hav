/**
 * Created by sean on 01/02/17.
 */
import React from 'react'

import { Dimmer, Loader } from 'semantic-ui-react'

class LoadingIndicator extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }

    componentDidMount() {
        this.setState({
            active: true
        })
    }
    handleClick() {
        this.setState({
            active: false
        })
    }
    render() {
        return <Dimmer active={this.state.active} inverted onClick={()=>this.handleClick()}>
            <Loader>Loading</Loader>
        </Dimmer>
    }
}

export default LoadingIndicator;

