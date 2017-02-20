/**
 * Created by sean on 17/02/17.
 */
import {getStateKeyForPath} from '../browser'


test('get path from string (no-op)', () => {
    let p = 'repo/a/b/c';
    expect(getStateKeyForPath(p)).toBe(p);
});

test('resolve path from object', () => {
    expect(
        getStateKeyForPath({
                repository: 'repo',
                path: 'a/b/c'
        })
    ).toBe('repo/a/b/c')
})

test('strip slashes from string', () => {
    expect(
        getStateKeyForPath('incoming/')
    ).toBe('incoming')
    expect(
        getStateKeyForPath('/incoming/')
    ).toBe('incoming')
    expect(
        getStateKeyForPath('/incoming')
    ).toBe('incoming')
})

test('test cheeky paths', () => {
    expect(
        getStateKeyForPath({
                repository: 'repo',
                path: undefined
        })
    ).toBe('repo')

    expect(
        getStateKeyForPath({
                repository: 'repo',
                path: ''
        })
    ).toBe('repo')
    // expect(
    //     getStateKeyForPath({
    //             repository: 'repo',
    //             path: '    '
    //     })
    // ).toBe('repo')
    expect(
        getStateKeyForPath({
                repository: 'repo',
                path: '/'
        })
    ).toBe('repo')
})