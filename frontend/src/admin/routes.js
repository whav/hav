/**
 * Created by sean on 01/02/17.
 */
import Welcome from './home'
import FileBrowser from './containers/filebrowser'
import {Uploads} from './containers/uploads'

import GoHome from 'react-icons/go/home'
import GoFileDirectory from 'react-icons/go/file-directory'
import GoCloudUpload from 'react-icons/go/cloud-upload'
import GoTriangleRight from 'react-icons/go/triangle-right'

const routes = [
    {
        path: '/',
        main: Welcome,
        title: 'Home',
        icon: GoHome,
        menuExact: true,
        routes: [
            {
                path: '/about/',
                title: 'About',
                main: Welcome
            }
        ]
    },
    {
        path: '/incoming/:path*/',
        menuPath: '/incoming/',
        main: FileBrowser,
        icon: GoFileDirectory,
        title: 'Incoming',
        menuExact: false
    },
    {
        path: '/uploads/',
        main: Uploads,
        icon: GoCloudUpload,
        title: 'Uploads',
        menuExact: true
    }
]

// this should be merged with all routes defined above
const routeDefaults = {
    title: 'NoName',
    menuExact: false,
    icon: GoTriangleRight,
    routes: []
}

const applyDefaults = (route) => {
    let rc = {
        ...routeDefaults,
        ...route
    };
    // menuPath
    if (!rc.hasOwnProperty('menuPath')) {
        rc.menuPath = rc.path;
    }
    rc.routes = rc.routes.map((subroute) => applyDefaults(subroute))
    return rc
}

export default routes.map((r) => applyDefaults(r));