import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as express from "express";
// import * as serveStatic from "serve-static";
import * as compression from "compression";
import * as bodyParser from "body-parser";
// import * as cookieParser from "cookie-parser";
import { parseAndRun } from "./runner"

import * as Datastore from "nedb";
const db = new Datastore({ filename: "db.db", autoload: true });

const PORT = 3000;
let plugins: { [pluginName: string]: any } = {}
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
            let module = require(path.join(__dirname, dir, file));
            plugins[path.basename(file, ".js")] = module;
            console.log(`Loaded plugin: ${module.name} from ${file}`);
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

app.route("/integration/setup/:plugin/:name")
    .post(bodyParser.json(), (request, response) => {
        let pluginName = request.params.plugin as string;
        let instanceName = request.params.name as string;
        if (!plugins[pluginName]) {
            response.status(500).json({
                "error": "Invalid plugin name"
            });
            return;
        }
        
        db.update({
            "plugin": pluginName,
            "instanceName": instanceName,
        },
        {
            "plugin": pluginName,
            "instanceName": instanceName,
            "data": request.body
        }, {upsert: true});
        response.json({
            "success": true
        });
    })
    .get((request, response) => {
        let pluginName = request.params.plugin as string;
        let instanceName = request.params.name as string;
        db.findOne({
            "plugin": pluginName,
            "instanceName": instanceName
        }, (err, doc) => {
            response.json({
                "success": true,
                "data": doc
            }); 
        });
    });

app.route("/run").post(bodyParser.json(), async (request, response) => {
    let graph = request.body;
    await parseAndRun(plugins, graph, instanceName => {
        return new Promise<any>((resolve, reject) => {
            db.findOne<any>({ instanceName }, (err, doc) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(doc.data);
            });
        });
    });
    response.json({
        "success": true
    });
});

app.listen(PORT, () => {
	console.log(`BoH4 system started on port ${PORT}`);
});
