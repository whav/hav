/**
 * Created by sean on 01/02/17.
 */
import Welcome from './home'
import FileBrowser from './containers/filebrowser'
import {Uploads} from './containers/uploads'

import GoHome from 'react-icons/go/home'
import GoFileDirectory from 'react-icons/go/file-directory'
import GoFileSubmodule from 'react-icons/go/file-submodule'
import GoCloudUpload from 'react-icons/go/cloud-upload'
import GoDatabase from 'react-icons/go/database'

const routes = [
    {
        path: '/',
        main: Welcome
    },
    {
        path: '/source/:repository/:path*/',
        main: FileBrowser
    },
    {
        path: '/uploads/',
        main: Uploads,
    }
]

const mainNav = [
    {
        title: 'Home',
        icon: GoHome,
        menuExact: true,
        link: '/'
    },
    {
        title: 'Sources',
        icon: GoFileSubmodule,
        sub: [
            {
                link: '/source/incoming/',
                icon: GoFileDirectory,
                title: 'Incoming',
                menuExact: false

            },
            {
                link: '/source/whav/',
                icon: GoDatabase,
                title: 'WHAV',
                menuExact: false
            }
        ]
    },
    {
        icon: GoCloudUpload,
        title: 'Uploads',
        menuExact: true,
        link: '/uploads/'
    }
]

export {mainNav, routes}
