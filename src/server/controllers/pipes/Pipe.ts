import Logger from '../nodes/services/logger';
import Value from '../nodes/primitives/value';
import { INode, IOutput } from '../nodes/node';
import Input from '../nodes/primitives/input';
import Concat from '../nodes/manipulators/concat';

const pluginList = {
    input: Input,

    concat: Concat,

    logger: Logger,
};

export default class Pipe {
    private inputLayer: { [p: string]: Input };
    private outputLayer: [IOutput];

    constructor(inputs: { [p: string]: Input } = {}, outputs: [IOutput] = [] as [IOutput]) {
        this.inputLayer = inputs;
        this.outputLayer = outputs;
    }

    parseFromString(str: string) {
        // Example string
        // a: input, b: input, c: concat, o: logger |
        // a -[data1]-> c |
        // b -[data2]-> c |
        // c -[foo]-> o |
        // " yeah!!" -[bar]-> o

        const lines = str.split('|');
        // TODO: Validate string

        // initialize each node
        const nodeStrings = lines.shift().split(',');
        const nodes = {};
        for (const nodeString of nodeStrings) {
            const kv = nodeString.trim().split(':');
            const name = kv[0].trim();
            const nodeType = kv[1].trim();
            const node = new pluginList[nodeType]();
            nodes[name] = node;
            if (nodeType === 'input') {
                this.inputLayer[name] = node;
            } else if (node.isOutput) {
                this.outputLayer.push(node);
            }
        }

        // bind each node to its parent
        for (const line of lines) {
            const regex = /(.*)-\[(.*)\]->(.*)/;
            const result = regex.exec(line);
            // TODO: Validate string
            const source = result[1].trim();
            const prop = result[2].trim();
            const destination = result[3].trim();

            if (source in nodes) {
                nodes[destination].inputs[prop] = nodes[source];
            } else {
                if (source.charAt(0) === '"' && source.charAt(source.length - 1) === '"') {
                    nodes[destination].inputs[prop] = new Value(source.slice(1, source.length -1));
                } else {
                    // TODO: more string validation
                    nodes[destination].inputs[prop] = new Value(parseFloat(source));
                }
            }
        }
    }

    run(inputs: { [p: string]: any }) {
        for (const key in this.inputLayer) {
            if (!(key in inputs)) {
                throw new Error(`expected ${key} as an input`);
            }

            this.inputLayer[key].setValue(inputs[key]);
        }

        const obj = {};
        for (const output of this.outputLayer) {
            obj[output.getServiceName()] = output.propagate();
        }

        return obj;
    }
}