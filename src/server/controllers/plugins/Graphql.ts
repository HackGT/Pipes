var request = require('request');

import { TransformPlugin } from '../Transformer';
import { pipeOutput } from '../Node';



type pluginDependencies = {
    method: string,
    url: string,
    query: string,
    auth: string,
    selector: string
}

//todo add support for optional args
type pluginOptionals = {
    operationName: string,
    variables: string
}

export class GraphQL extends TransformPlugin {

    private dependencies: pluginDependencies = {
        method: null,
        url: null,
        query: null,
        auth: null,
        selector: null,
    };

    public async propagate(): Promise<pipeOutput> {
        const { method, url, query, auth, selector } = this.dependencies;

        let output;

        const sendQuery = () => new Promise((resolve, reject) => {
                const requestCallback = (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(body);
                    }
                }
                const headers = {
                    'Authorization': 'Basic ' + auth,
                    'content-type': 'application/json',
                }
                if (method === 'GET') {
                    reject("GET not yet supported for GraphQL");
                    // request.get({url: `${url}?query=${query}`, headers: headers}, requestCallback)
                } else if (method === 'POST') {
                    request.post({url: url, body: JSON.stringify({query: query}), headers: headers}, requestCallback);
                } else {
                    reject(`Unexpected method found. Method must be GET or POST,
                        got ${method}`);
                }
            }
        );

        const promise = sendQuery()
                .then(val => output = val)
                .catch(err => output = JSON.stringify(err));

        await(promise);

        output = JSON.parse(output)['data'];
        const formattedOutput = [];
        this.parseHelper(output, selector.split("."), formattedOutput);
        return {data: formattedOutput, iterable: true};
    }

    public getNodeName(): string {
        return 'GraphQL';
    }

    public buildDependencies(iterable, value, key) {
        switch (key) {
            case 'method':
                if (iterable || Array.isArray(value))
                    throw Error(`GraphQL's property 'method' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.method = value;
                break;
            case 'url':
                if (iterable || Array.isArray(value))
                    throw Error(`GraphQL's property 'url' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.url = value;
                break;
            case 'query':
                if (iterable || Array.isArray(value))
                    throw Error(`GraphQL's property 'query' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.query = value;
                break
            case 'auth':
                if (iterable || Array.isArray(value))
                    throw Error(`GraphQL's property 'auth' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.auth = value;
                break
            case 'selector':
                if (iterable || Array.isArray(value))
                    throw Error(`GraphQL's property 'selector' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.selector = value;
                break
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.method !== null &&
            this.dependencies.url !== null &&
            this.dependencies.query !== null &&
            this.dependencies.selector !== null &&
            this.dependencies.auth !== null;
    }

    private parseHelper(json, selector, out) {
        let current = json;
        for (let i = 0; i < selector.length; i++) {
            current = current[selector[i]];
            if (Array.isArray(current)) {
                for (let j = 0; j < current.length; j++) {
                    this.parseHelper(current[j], selector.slice(i+1), out)
                }
                return;
            }
        }
        out.push(current);    
    }
}