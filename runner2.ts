import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { InputPlugin, TransformPlugin, OutputPlugin } from "./plugins/plugin";

type AnyPlugin = InputPlugin | TransformPlugin | OutputPlugin;
interface InputFormat {
    nodes: {
        [nodeName: string]: {
            type: string;
            [property: string]: any;
        };
    };
    connections: {
       from: string;
       to: string;
       mapping: {
           [mapping: string]: string
       };
    }[];
}
let plugins: { [pluginName: string]: AnyPlugin } = {};

export async function loadPlugins(dir: string = "plugins") {
    let readdirAsync = util.promisify(fs.readdir) as (path: string | Buffer) => Promise<string[]>;
    let files = await readdirAsync(path.join(__dirname, dir));
    for (let file of files) {
        if (path.extname(file) === ".js") {
            try {
                let imported = await import(path.join(__dirname, dir, path.basename(file, ".js")));
                // Plugins only export one thing
                let plugin = imported[Object.keys(imported)[0]];

                plugins[plugin.pluginName] = plugin;
                console.log(`Loaded plugin: ${plugin.pluginName} from ${file}`);
            }
            catch (err) {
                console.warn(`Could not load plugin from ${file}: ${err.message}`);
            }
        }
    }
}

export async function parseAndExecute(input: InputFormat) {
    let chain: (InputPlugin | TransformPlugin | OutputPlugin)[] = [];

    let froms: string[] = [];
    let tos: string[] = [];

    for (let connection of input.connections) {
        froms.push(connection.from);
        tos.push(connection.to);
    }
    for (let from of froms) {
        if (tos.indexOf(from) === -1) {
            // This node has no input dependencies and should therefore begin our chain"
            chain.push(plugins[input.nodes[from].type]);
        }
    }
}

export async function test() {
    loadPlugins();
}
