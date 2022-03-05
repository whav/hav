import express from "express";
import {URL} from 'url';
import {readFileSync} from 'fs';
import path from 'path';
import {bundleMDX} from "mdx-bundler";

const __dirname = decodeURIComponent(new URL('.', import.meta.url).pathname);
const globals = readFileSync(path.join(__dirname, 'globals.js'), 'utf-8');

console.log(globals);

const app = express();
const port = 3000;

console.log('CWD will be set to:', __dirname);

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
    res.send("Don't get me!");
});

app.post("/", async (req, resp, next) => {
    try {
        const mdx_content = req.body.mdx || "";
        const bundle = await bundleMDX(mdx_content || "", {
            cwd: __dirname,
            esbuildOptions: (options) => {
                options.loader = {
                    '.js': 'jsx'
                };
                options.minify = false;
                options.target = [
                    'es2020',
                ];
                return options;
                return options;
            }
        });
        resp.type(".js");
        resp.send(bundle.code);
    } catch (e) {
        next(e);
    }
});

app.listen({port}, () => {
    console.log(`MDX Server running at http://localhost:${port}`);
});
