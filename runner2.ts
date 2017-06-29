import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { InputPlugin, TransformPlugin, OutputPlugin } from "./plugins/plugin";

type AnyPlugin = (typeof InputPlugin | typeof TransformPlugin | typeof OutputPlugin) & {
    new(config: Object): InputPlugin | TransformPlugin | OutputPlugin   
};

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
                let plugin = imported[Object.keys(imported)[0]] as AnyPlugin;

                plugins[plugin.name] = plugin;
                console.log(`Loaded plugin: ${plugin.name} from ${file}`);
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
            // This node has no input dependencies and should therefore begin our chain
            let instance = plugins[input.nodes[from].type];
            chain.push(new instance(input.nodes[from]));
        }
    }
}

async function test() {
    await loadPlugins();
    await parseAndExecute(
        JSON.parse(
            fs.readFileSync(
                path.join(__dirname, "graph_examples", "cryptography-proposed.json")
            , "utf8")
        )
    );
}
test();
