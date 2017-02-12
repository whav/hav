/**
 * Created by sean on 09/02/17.
 */
export const ROUTER_STATE = 'ROUTER_STATE'

export const route_changed = (route) => ({
    type: ROUTER_STATE,
    payload: route
})

export default route_changed