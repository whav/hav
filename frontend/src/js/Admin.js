import React from 'react';
import { Layout, Panel, IconButton } from 'react-toolbox';
import AppBar from 'react-toolbox/lib/app_bar';
import Navigation from 'react-toolbox/lib/navigation';
import Link from 'react-toolbox/lib/link';

class AdminShell extends React.Component {
    render() {
        return (<Layout>
            <Panel>

                <AppBar fixed flat>
                    <IconButton icon='menu' inverse={ true }/>
                    <Navigation>
                        
                    </Navigation>
                </AppBar>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem' }}>
                    {this.props.children}
                </div>
            </Panel>
        </Layout>);
    }
}

export default AdminShell;