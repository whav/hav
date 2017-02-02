/**
 * Created by sean on 01/02/17.
 */
import FileBrowser from './browser'
import Welcome from './home'

const routes = [
    {
        path: '/',
        main: Welcome,
        title: 'Home'
    },
    {
        path: '/incoming/',
        main: FileBrowser,
        title: 'Incoming'
    }
]

export default routes