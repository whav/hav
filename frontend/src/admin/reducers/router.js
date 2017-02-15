/**
 * Created by sean on 09/02/17.
 */
import {ROUTER_STATE} from '../actions/router'

const router = (state={}, action) => {
    switch (action.type) {
        case ROUTER_STATE:
            return {
                ...action.payload
            }
        default:
            return state
    }
}

export default router