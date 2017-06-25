import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as express from "express";
// import * as serveStatic from "serve-static";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as _ from "lodash";
const cors = require('cors');
// import * as cookieParser from "cookie-parser";
import { parseAndRun } from "./runner"
import { text2graph } from "./nlp"

import * as Datastore from "nedb";
const db = new Datastore({ filename: "db.db", autoload: true });

const PORT = 3000;
let plugins: { [pluginName: string]: any } = {}
// let secrets: {
//     [service: string]: any
// } = {};

export let app = express();
app.use(compression());
app.use(cors());
// TODO: let cookieParserInstance = cookieParser(undefined, COOKIE_OPTIONS);
// app.use(cookieParserInstance);

async function loadPlugins(dir: string = "plugins") {
    let readdirAsync = util.promisify(fs.readdir) as (path: string | Buffer) => Promise<string[]>;
    let files = await readdirAsync(path.join(__dirname, dir));
    plugins = [];
    for (let file of files) {
        if (path.extname(file) === ".js") {
            try {
                let module = require(path.join(__dirname, dir, file));
                // Test if module is valid
                assert(module.name, "Module missing name");
                assert(module.inputs, "Module missing inputs");
                assert(module.outputs, "Module missing outputs");
                assert(module.requires, "Module missing requires");
                assert(module.run, "Module missing run method");
                assert(module.parse_language, "Module missing language parse method");

                plugins[path.basename(file, ".js")] = module;
                console.log(`Loaded plugin: ${module.name} from ${file}`);
            }
            catch (err) {
                console.warn(`Could not load plugin from ${file}: ${err.message}`);
            }
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
            if (!doc) {
                response.json({
                    "error": "The requested instance or plugin could not be found"
                });
                return;
            }
            response.json({
                "success": true,
                "data": doc
            }); 
        });
    });
app.route("/graph/:graphName").get((request : any, response) => {
    response.json(request.graph);
})
app.route("/graph/:name/create").post(bodyParser.json(), async (request, response) => {
    let graph = request.body;
    db.update({graphName: request.params.name}, {graphName: request.params.name, 
        graph: JSON.stringify(graph)}, {upsert: true}, (err) => {
        console.error(err);
    });
    response.json({success: true});
});
app.route("/graph/:graphName/run/").post(bodyParser.json(), async (request : any, response) => {
    let graph = request.graph;
    for (let key of Object.keys(request.body)) {
        _.set(graph,key, request.body[key]);
    }
    try {
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
    }
    catch (err) {
        response.json({
            "error": err.message,
            "stack": err.stack
        });
    }
});
app.param('graphName', (req: any, res, next, graphName) => {
    db.findOne<any>({ graphName }, (err, doc) => {
            if (err) {
                next(err);
                return;
            }
            if (doc) {
                req.graph = JSON.parse(doc.graph);
            }
            else {
                res.status(404).json({
                    "error": "Not found"
                });
            }
            next();
        });
});

app.route("/run/").post(bodyParser.json(), async (request : any, response) => {
    try {
        await parseAndRun(plugins, request.body, instanceName => {
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
    }
    catch (err) {
        response.json({
            "error": err.message,
            "stack": err.stack
        });
    }
});

app.route("/nlp/").post(bodyParser.json(), async (request : any, response) => {
    try {
        var graph = await text2graph(plugins, request.body.text, pluginName => {
            return new Promise<any>((resolve, reject) => {
                db.findOne<any>({plugin: pluginName}, (err, doc) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(doc.instanceName);
                })
            })
        } )
        response.json({
            "success": true,
            "graph": graph!
        });
    }
    catch (err) {
        console.log("error")
        response.json({
            "error": err.message,
            "stack": err.stack
        });
    }
});
app.listen(PORT, () => {
	console.log(`BoH4 system started on port ${PORT}`);
});
