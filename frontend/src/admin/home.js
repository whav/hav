/**
 * Created by sean on 01/02/17.
 */
import React from 'react';
import LoadingIndicator from './ui/loading'

const Welcome = () => {
    return <div>
        <h1>Here be stuff</h1>
        <LoadingIndicator rotate={true} text="Me be loading!"/>
    </div>
}

export default Welcome