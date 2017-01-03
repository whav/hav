import React from 'react';

class AdminShell extends React.Component {
    render() {
        return (<div className="admin-shell">
                    {this.props.children}
        </div>);
    }
}

export default AdminShell;