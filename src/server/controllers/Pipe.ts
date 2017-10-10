import { Input } from './Input';
import { TransformPlugin } from './Transformer';
import { OutputPlugin } from './Output';
import { Mapper } from './Mapper';
import { Static } from './plugins/Static';
import { Concat } from './plugins/Concat';
import { Logger } from './plugins/Logger';
import { Email } from './plugins/Email';
import { Slack } from './plugins/Slack';
import { Twitter } from './plugins/Twitter';
import { GraphQL } from './plugins/Graphql';
import { Push } from './plugins/Push';
import {Writable} from 'stream';
import { commonOptions } from './Node';

type NodeConstructor = { new(): Input | TransformPlugin | OutputPlugin };

const plugins: { [pluginName: string]: NodeConstructor } = {
    'Logger': Logger,
    'Concat': Concat,
    'Input': Input,
    'Slack': Slack,
    'Twitter': Twitter,
    'Email': Email,
    'GraphQL': GraphQL,
    'Push': Push,
};
const illegalProperties = [
    'iterable'
];

class Aggregator extends Writable {
    private _out: {} = {};
    private expected: string[] = [];
    private callback = null;
    private complete = false;

    constructor() {
        super(commonOptions);
    }

    _write(chunk, encoding, callback) {
        const x = Object.keys(chunk);
        if(x.length != 1) {
            throw new Error('Output object should have 1 key');
        }
        this._out[`${x[0]}`] = chunk[x[0]];

        for(const nodeId of this.expected) {
            if(!(nodeId in this._out)) {
                return callback()
            }
        }

        this.complete = true;
        if(this.callback !== null) {
            this.callback(this._out);
        }
    }

    public getOut(callback: (out)=>void) {
        this.callback = callback;

        if(this.complete) {
            this.callback(this._out);
        }
    }

    public expect(nodeId) {
        this.expected.push(nodeId);
    }
}

export default class Pipe {

    private inputs: { [name: string]: Input } = {};
    private aggregator: Aggregator;

    constructor(inputs: { [name: string]: Input } = {}) {
        this.inputs = inputs;
        this.aggregator = new Aggregator();
    }

    parseFromString(str: string) {
        // Example string
        // a: Input, b: Input, c: Concat, o: Logger |
        // a -[0]-> c |
        // b -[1]-> c |
        // "2" -[len]-> c |
        // c -[data]-> o

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
            if (nodes[nodeId].isOutput === true) {
                nodes[nodeId].pipe(new Mapper({value: nodeId})).pipe(this.aggregator, { end: false });
                this.aggregator.expect(nodeId);
            }
        }

        // bind edges to mappers
        for (const line of lines) {
            const regex = /((.|\s)*)-\[(.*)\]->(.*)/;
            const result = regex.exec(line);
            if (result === null) {
                throw new Error('Edges must be in the format: {from}-[{prop}]->{to}');
            }

            const from = result[1].trim();
            const prop = result[3].trim();
            const to = result[4].trim();

            if (from === '' || prop === '' || to === '') {
                throw new Error('Edges must be in the format: {from}-[{prop}]->{to}');
            }

            if (!(to in nodes)) {
                throw new Error(`Node ${to} must be declared.`);
            }

            if (illegalProperties.includes(prop)) {
                throw new Error(`Property ${prop} is illegal.`);
            }

            // Static values to Nodes
            if (from.charAt(0) === '"' && from.charAt(from.length - 1) === '"') {
                const val = new Static(from.slice(1, from.length - 1));
                const map = new Mapper({ 'data': prop });
                val.pipe(map).pipe(nodes[to], {end: false});
            } else if(/\[(".*",?\s*?)*\]/g.test(from)) {
                const arrayElems = from.slice(1, from.length-1).split(',');
                const arr = [];
                for(const elem of arrayElems) {
                    const s = elem.trim();
                    if(s.charAt(0) !== '"' || s.charAt(s.length-1) !== '"') {
                        throw new Error('Arrays can only contain strings');
                    }
                    arr.push(s.slice(1,s.length-1));
                }


                const val = new Static(arr);
                const map = new Mapper({ 'data': prop });
                val.pipe(map).pipe(nodes[to], {end: false});
            } else { // Nodes to Nodes
                if (!(from in nodes)) {
                    throw new Error(`Node ${from} must be declared.`);
                }

                const map = new Mapper({ 'data': prop });


                nodes[from].pipe(map).pipe(nodes[to], {end: false});
            }
        }
    }

    run(inputs: { [name: string]: any }, callback: (out)=>void) {
        for (const name in inputs) {
            this.inputs[name].push({
                data: inputs[name]['data'],
                iterable: inputs[name]['iterable'] === undefined ?
                    false : inputs[name]['iterable'],
            });
        }

        this.aggregator.getOut(callback);
    }
}