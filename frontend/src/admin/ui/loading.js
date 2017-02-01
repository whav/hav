/**
 * Created by sean on 01/02/17.
 */
import React from 'react'
import FaBeer from 'react-icons/fa/beer'
import classNames from 'classnames'

const sizesToClass = {
    'default': 'f3',
    'large': 'f2',
    'x-large': 'f1'
}

export default class LoadingIndicator extends React.Component {
    render() {
        let {text, rotate, size} = this.props;

        return <div className={classNames('loading-indicator', sizesToClass[size], {...this.props.className})}>
            <div className={classNames('loading-indicator-icon', {rotating: rotate})}>
                <FaBeer />
            </div>
            { text ? <p>{text}</p> : null }
        </div>
    }
}

LoadingIndicator.defaultProps = {
    text: 'Loading ...',
    size: 'default',
    rotate: true
}

LoadingIndicator.propTypes = {
    text:  React.PropTypes.string,
    rotate: React.PropTypes.bool.isRequired,
    size: React.PropTypes.oneOf(['default', 'large', 'x-large']),

}

