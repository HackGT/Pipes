import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as express from "express";
// import * as serveStatic from "serve-static";
import * as compression from "compression";
// import * as cookieParser from "cookie-parser";

const PORT = 3000;
let plugins: any[] = []
// let secrets: {
//     [service: string]: any
// } = {};

export let app = express();
app.use(compression());
// TODO: let cookieParserInstance = cookieParser(undefined, COOKIE_OPTIONS);
// app.use(cookieParserInstance);

async function loadPlugins(dir: string = "plugins") {
    let readdirAsync = util.promisify(fs.readdir) as (path: string | Buffer) => Promise<string[]>;
    let files = await readdirAsync(path.join(__dirname, dir));
    plugins = [];
    for (let file of files) {
        if (path.extname(file) === ".js") {
            plugins.push(require(path.join(__dirname, dir, file)));
            console.log(`Loaded plugin: ${file}`);
        }
    }
}
async function loadSecrets(file: string = "config.json") {

}
loadPlugins().catch(console.error.bind(console));
loadSecrets().catch(console.error.bind(console));

app.route("/").get((request, response) => {
    response.send("Hello, world!");
});

app.listen(PORT, () => {
	console.log(`BoH4 system started on port ${PORT}`);
});
