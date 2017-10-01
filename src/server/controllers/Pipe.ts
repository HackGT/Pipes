import { InputPlugin, Mapper, OutputPlugin, TransformPlugin } from './nodes/Node';
import { Static } from './nodes/Static';
import { Input } from './nodes/Input';
import { Logger } from './nodes/Logger';
import { Concat } from './nodes/Concat';

type AnyPlugin = (typeof InputPlugin | typeof TransformPlugin | typeof OutputPlugin) & {
    new(config: Object): InputPlugin | TransformPlugin | OutputPlugin
};
type Node = (InputPlugin | TransformPlugin | OutputPlugin | Mapper);

const plugins: { [pluginName: string]: AnyPlugin } = {
    'Logger': Logger,
    'Concat': Concat,
    'Input': Input
};


export default class Pipe {

    private inputs: { [name: string]: Input } = {};

    constructor(inputs: { [name: string]: Input } = {}) {
        this.inputs = inputs
    }
    parseFromString(str: string) {
        // Example string
        // a: Input, b: Input, c: Concat, o: Logger |
        // a -[0]-> c |
        // b -[1]-> c |
        // "2" -[len]-> c |
        // c -[data]-> o |
        // " yeah!!" -[data]-> o

        const lines = str.split('|');

        // initialize each node
        const nodeStrings = lines.shift().split(',');
        const nodes = {};
        for (const nodeString of nodeStrings) {
            const [nodeId, nodeType] = nodeString.trim().split(':')
                .map((val) => val.trim());
            if (nodeId in nodes) {
                throw new Error(`Node ${nodeId} cannot be declared multiple times.`);
            }
            if (!(nodeType in plugins)) {
                throw new Error(`Plugin ${nodeType} does not exist.`);
            }

            nodes[nodeId] = new plugins[nodeType]();
            if (nodeType === 'Input') {
                this.inputs[nodeId] = nodes[nodeId];
            }
        }

        // bind edges to mappers
        for (const line of lines) {
            const regex = /(.*)-\[(.*)\]->(.*)/;
            const result = regex.exec(line);

            if (result === null) {
                throw new Error('Edges must be in the format: {from}-[{prop}]->{to}');
            }

            const from = result[1].trim();
            const prop = result[2].trim();
            const to = result[3].trim();

            if (from === '' || prop === '' || to === '') {
                throw new Error('Edges must be in the format: {from}-[{prop}]->{to}');
            }

            if (!(to in nodes)) {
                throw new Error(`Node ${to} must be declared.`);
            }

            // Static values to Nodes
            if (from.charAt(0) === '"' && from.charAt(from.length - 1) === '"') {
                const val = new Static({ data: from.slice(1, from.length - 1) });
                const map = new Mapper({ 'data': prop });
                val.pipe(map).pipe(nodes[to]);

            } else { // Nodes to Nodes
                if (!(from in nodes)) {
                    throw new Error(`Node ${from} must be declared.`);
                }

                const map = new Mapper({ 'data': prop });
                nodes[from].pipe(map).pipe(nodes[to]);
            }
        }
    }

    async run(inputs: { [name: string]: any }) {
        for (const name in inputs) {
            this.inputs[name].push({data:inputs[name]});
        }
    }
}