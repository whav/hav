import PropTypes from 'prop-types';
/**
 * Created by sean on 01/02/17.
 */
import React from 'react'
import GoHistory from 'react-icons/go/history'
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
                <GoHistory />
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
    text:  PropTypes.string,
    rotate: PropTypes.bool.isRequired,
    size: PropTypes.oneOf(['default', 'large', 'x-large']),

}

