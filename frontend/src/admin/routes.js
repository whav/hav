/**
 * Created by sean on 01/02/17.
 */
import FileBrowser from './browser'
import Welcome from './home'

const routes = [
    {
        path: '/',
        main: Welcome,
        title: 'Home',
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
        title: 'Incoming',
        menuExact: false
    }
]

// this should be merged with all routes defined above
const routeDefaults = {
    title: 'NoName',
    menuExact: false,
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