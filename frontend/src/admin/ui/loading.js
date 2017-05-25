/**
 * Created by sean on 01/02/17.
 */
import React from 'react'

import { Dimmer, Loader } from 'semantic-ui-react'

const LoadingDiv = (props) =>  (
    <div className='loading-container'>
        {props.children}
    </div>
)


const LoadingIndicator = ({active=true, text='Loading'}) => {
    return <Loader active={active}>
        {text}
    </Loader>
}



class LoadingDimmer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            active: true
        }
    }

    handleClick() {
        this.setState({
            active: false
        })
    }

    render() {
        return <Dimmer.Dimmable as={LoadingDiv} dimmed={this.state.active}>
                <Dimmer active={this.state.active} inverted onClick={()=>this.handleClick()}>
                <LoadingIndicator />
            </Dimmer>
        </Dimmer.Dimmable>
    }
}

export default LoadingIndicator;
export {LoadingDimmer, LoadingDiv};
