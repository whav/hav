/**
 * Created by sean on 03/01/17.
 */
import Cookies from 'js-cookie'

export function getCSRFCookie() {
    return Cookies.get('csrftoken');
}