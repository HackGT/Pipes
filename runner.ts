import { promises as fs } from "fs";
import * as path from "path";
import { TransformPlugin } from "./plugins/plugin";

type CommonPlugin = TransformPlugin<object, object>;
interface CommonPluginConstructor {
    new(...args: any[]): CommonPlugin;
};

interface InputFormat {
    version: number;
    plugins: {
        [name: string]: string;
    }
    nodes: {
        [nodeName: string]: {
            type: string;
            name?: string;
            arguments?: any[];
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

export async function loadPlugins(input: InputFormat, file: string): Promise<Map<string, CommonPluginConstructor>> {
    
    let plugins: Map<string, CommonPluginConstructor> = new Map();
    for (let [name, location] of Object.entries(input.plugins)) {
        try {
            // Resolve locations relative to the graph file instead of runner.ts
            location = path.join(__dirname, path.dirname(file), location);
            let plugin = (await import(location))[name] as CommonPluginConstructor | undefined;
            if (!plugin) {
                throw new Error(`Plugin at ${location} did not match name "${name}"`);
            }
            plugins.set(name, plugin);
            console.log(`Loaded plugin: ${name} from ${location}`);
        }
        catch (err) {
            console.warn(`Could not load plugin ${name} from ${location}: ${err.message}`);
        }
    }
    return plugins;
}

function moveToBack<T>(arr: T[], item: T): T[] {
    let index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
    arr.push(item);
    return arr;
}

export async function execute(file: string) {
    const graph = JSON.parse(await fs.readFile(file, "utf8")) as InputFormat;
    const plugins = await loadPlugins(graph, file);
    let nodes: Map<string, CommonPlugin> = new Map();
    for (let [name, details] of Object.entries(graph.nodes)) {
        let plugin = plugins.get(details.type);
        if (!plugin) {
            throw new Error(`Node "${name}" requested nonexistent plugin "${details.type}"`);
        }
        let node = details.arguments ? new plugin(...details.arguments) : new plugin();
        if (details.name) {
            node.setName(details.name);
        }
        nodes.set(name, node);
    }

    let resumeOrder: string[] = [];
    for (let connection of graph.connections) {
        let from = nodes.get(connection.from);
        let to = nodes.get(connection.to);
        if (!from) {
            throw new Error(`Invalid source node "${from}"`);
        }
        if (!to) {
            throw new Error(`Invalid destination node "${to}"`);
        }
        from.pipe(to, connection.mapping, false);
        moveToBack(resumeOrder, connection.from);
    }
    
    for (let nodeToResume of resumeOrder) {
        let node = nodes.get(nodeToResume);
        if (!node) continue;
        await node.resume();
    }
}

(async function() {
    try {
        await execute("./graph_examples/cryptography-proposed.json");
    }
    catch (err) {
        console.error(err.stack);
    }
})();
