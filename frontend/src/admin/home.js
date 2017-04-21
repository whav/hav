/**
 * Created by sean on 01/02/17.
 */
import React from 'react';
import LoadingIndicator from './ui/loading'

const Welcome = () => {
    return <div>
        <h1>Look to the left, this will just keep loading.</h1>
        <LoadingIndicator rotate={true} text="Me be loading!"/>
    </div>
}

export default Welcome