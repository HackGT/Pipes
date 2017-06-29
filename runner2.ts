import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { Writable } from "stream";
import { InputPlugin, TransformPlugin, OutputPlugin, Mapper } from "./plugins/plugin";

type AnyPlugin = (typeof InputPlugin | typeof TransformPlugin | typeof OutputPlugin) & {
    new(config: Object): InputPlugin | TransformPlugin | OutputPlugin   
};
type Pipeline = (InputPlugin | TransformPlugin | OutputPlugin | Mapper)[];

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

export async function parse(input: InputFormat): Promise<Pipeline> {
    let pipeline: Pipeline = [];

    let froms: string[] = [];
    let tos: string[] = [];
    let resolvedTos: string[] = [];
    let addedNodes: string[] = [];
    let allNodes = new Set<string>();

    for (let connection of input.connections) {
        froms.push(connection.from);
        tos.push(connection.to);
    }

    function occurances<T>(arr: T[], search: T): number {
        return arr.filter(val => val === search).length;
    }
    function addToChain(fromName: string, toName: string, mapping: { [mapping: string]: string }): void {
        addedNodes.push(fromName);

        let instance = plugins[input.nodes[fromName].type];
        pipeline.push(new instance(input.nodes[fromName]));
        pipeline.push(new Mapper(mapping));
        resolvedTos.push(toName);
    }

    const MAX_DEPTH = 50;
    let depth = 0;
    while (true) {
        for (let i = 0; i < input.connections.length; i++) {
            let connection = input.connections[i];
            allNodes.add(connection.from).add(connection.to);

            if (tos.indexOf(connection.from) === -1 && addedNodes.indexOf(connection.from) === -1) {
                // This node has no input dependencies and should therefore begin our chain
                console.log(`Added ${connection.from} (no dependencies)`)
                addToChain(connection.from, connection.to, connection.mapping);
            }
            // Check if dependencies are satisfied
            // Finished if # of resolved tos = # of total tos of that node name
            else if (occurances(resolvedTos, connection.from) === occurances(tos, connection.from) && addedNodes.indexOf(connection.from) === -1) {
                addToChain(connection.from, connection.to, connection.mapping);
                console.log(`Added ${connection.from} (all dependencies resolved)`)
            }
        }
        // Restart until there are no more pending dependencies
        if (depth++ >= MAX_DEPTH) {
            console.warn(`Maximum depth of ${MAX_DEPTH} exceeded`);
            return [];
        }
        if (allNodes.size - 1 === pipeline.length / 2) {
            for (let connection of input.connections) {
                if (froms.indexOf(connection.to) === -1 && addedNodes.indexOf(connection.to) === -1) {
                    addedNodes.push(connection.to);

                    let instance = plugins[input.nodes[connection.to].type];
                    pipeline.push(new instance(input.nodes[connection.to]));
                    console.log(`Added ${connection.to} (output with dependencies resolved)`)
                }
            }
            return pipeline;
        }
        console.log("Restarted loop to reevaluate dependencies");
    }
}

async function execute(pipeline: Pipeline) {
    for (let i = 0; i < pipeline.length - 1; i++) {
        pipeline[i].pipe(pipeline[i + 1] as Writable);
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
