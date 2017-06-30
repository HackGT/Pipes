import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { InputPlugin, TransformPlugin, OutputPlugin, Mapper, MultiPipe } from "./plugins/plugin";

type AnyPlugin = (typeof InputPlugin | typeof TransformPlugin | typeof OutputPlugin) & {
    new(config: Object): InputPlugin | TransformPlugin | OutputPlugin   
};
type Node = (InputPlugin | TransformPlugin | OutputPlugin | Mapper);
type Pipeline = {
    [name: string]: {
        node: Mapper | OutputPlugin;
        rawNode: Node;
        pipedTo: string[];
    }
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

export async function parse(input: InputFormat): Promise<Pipeline> {
    let pipeline: Pipeline = {};

    let froms: string[] = [];
    let tos: string[] = [];
    let resolvedTos: string[] = [];

    for (let connection of input.connections) {
        froms.push(connection.from);
        tos.push(connection.to);
    }

    function addToChain(fromName: string, toName: string, mapping: { [mapping: string]: string }): void {

        if (pipeline[fromName] === undefined) {
            let plugin = plugins[input.nodes[fromName].type];
            let instance = new plugin(input.nodes[fromName]);
            pipeline[fromName] = {
                "node": instance.pipe(new Mapper(mapping, fromName)),
                "rawNode": instance,
                "pipedTo": [toName]
            };
            console.log(`Mapping for ${fromName} is ${JSON.stringify(mapping)}`);
        }
        else {
            pipeline[fromName].pipedTo.push(toName);
        }
        resolvedTos.push(toName);
    }

    for (let connection of input.connections) {
        addToChain(connection.from, connection.to, connection.mapping);
        console.log(`Add node: ${connection.from}`);

        if (froms.indexOf(connection.to) === -1) {
            let plugin = plugins[input.nodes[connection.to].type];
            let instance = new plugin(input.nodes[connection.to]) as OutputPlugin;
            pipeline[connection.to] = {
                "node": instance,
                "rawNode": instance,
                "pipedTo": []
            };
            console.log(`Add terminating node: ${connection.to}`);
        }
    }

    return pipeline;
}

async function execute(pipeline: Pipeline) {
    for (let nodeName of Object.keys(pipeline)) {
        let pipelineObject = pipeline[nodeName];
        let node = pipelineObject.node;

        if (pipelineObject.pipedTo.length > 0) {
            let pipedNodes = pipelineObject.pipedTo.map(pipedNodeName => pipeline[pipedNodeName].rawNode) as (TransformPlugin | OutputPlugin)[];
            node.pipe(new MultiPipe(pipedNodes));
            console.log(`Piping ${nodeName} to ${pipelineObject.pipedTo.join(", ")}`);
        }
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
