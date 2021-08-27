import {bundleMDX} from 'mdx-bundler';
import { URL } from 'url'; // in Browser, the URL in native accessible on window
import {join} from 'path';
import {readFile} from 'fs/promises';
const __dirname = new URL('.', import.meta.url).pathname;

console.log(__dirname);

const mdx_file = join(__dirname, 'test.mdx');

const mdx_content = await readFile(mdx_file, 'utf-8');

console.log(mdx_content);

const bundle = await bundleMDX(mdx_content, {cwd: __dirname, esbuildOptions: (options) => {
    options.loader = {
        '.js': 'jsx'
    };
    return options;
    }})

console.log(bundle)
