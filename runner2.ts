import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { Writable } from "stream";
import { InputPlugin, TransformPlugin, OutputPlugin, Mapper } from "./plugins/plugin";

type AnyPlugin = (typeof InputPlugin | typeof TransformPlugin | typeof OutputPlugin) & {
    new(config: Object): InputPlugin | TransformPlugin | OutputPlugin   
};
type Chain = (InputPlugin | TransformPlugin | OutputPlugin | Mapper)[];

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

export async function parse(input: InputFormat): Promise<Chain> {
    let chain: Chain = [];

    let froms: string[] = [];
    let tos: string[] = [];
    let resolvedTos: string[] = [];

    for (let connection of input.connections) {
        froms.push(connection.from);
        tos.push(connection.to);
    }

    function occurances<T>(arr: T[], search: T): number {
        return arr.filter(val => val === search).length;
    }
    function addToChain(fromName: string, toName: string, mapping: { [mapping: string]: string }): void {
        let instance = plugins[input.nodes[fromName].type];
        chain.push(new instance(input.nodes[fromName]));
        chain.push(new Mapper(mapping));
        resolvedTos.push(toName);
    }

    for (let connection of input.connections) {
        if (tos.indexOf(connection.from) === -1) {
            // This node has no input dependencies and should therefore begin our chain
            console.log(`Added ${connection.from} (no dependencies)`)
            addToChain(connection.from, connection.to, connection.mapping);
        }
        // Check if dependencies are satisfied
        // Finished if # of resolved tos = # of total tos of that node name
        else if (occurances(resolvedTos, connection.from) === occurances(tos, connection.from)) {
            addToChain(connection.from, connection.to, connection.mapping);
            console.log(`Added ${connection.from} (all dependencies resolved)`)
        }
        
        if (froms.indexOf(connection.to) === -1) {
            let instance = plugins[input.nodes[connection.to].type];
            chain.push(new instance(input.nodes[connection.to]));
            console.log(`Added ${connection.to} (output with dependencies resolved)`)
        }
    }
    return chain;
}

async function execute(chain: Chain) {
    for (let i = 0; i < chain.length - 1; i++) {
        chain[i].pipe(chain[i + 1] as Writable);
    }
}

async function test() {
    await loadPlugins();
    let chain = await parse(
        JSON.parse(
            fs.readFileSync(
                path.join(__dirname, "graph_examples", "cryptography-proposed.json")
            , "utf8")
        )
    );
    await execute(chain);
}
test();
