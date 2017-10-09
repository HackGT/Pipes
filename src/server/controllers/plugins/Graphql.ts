var request = require('request');

import { OutputPlugin } from '../Output';



type pluginDependencies = {
    method: string | string[],
    url: string | string[],
    query: string | string[],
}

//todo add support for optional args
type pluginOptionals = {
    operationName: string | string[],
    variables: string | string[]
}

export class GraphQL extends OutputPlugin {

    private dependencies: pluginDependencies = {
        method: null,
        url: null,
        query: null
    };

    public async propagate(): Promise<string | string[]> {
        const { method, url, query } = this.dependencies;

        const promises = [];
        const outputs = [];

        const sendQuery = (method, url, query) => new Promise((resolve, reject) => {
                const requestCallback = (err, response, body) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(body);
                    }
                }
                if (method === 'GET') {
                    request.get(`$(url)?query=${query}`, requestCallback)
                } else if (method === 'POST') {
                    const headers = {'content-type': 'text/plain'};
                    request.post({url: url, body: query, headers: headers}, requestCallback);
                } else {
                    reject(`Unexpected method found. Method must be GET or POST,
                        got ${method}`);
                }
            }
        );

        if(this.numIter === null) this.numIter = 1;
        for (let i = 0; i < this.numIter; i++) {
            const promise = sendQuery(
                Array.isArray(method) ? method[i] : method,
                Array.isArray(url) ? url[i] : url,
                Array.isArray(query) ? query[i] : query)
                .then(val => outputs[i] = JSON.stringify(val))
                .catch(err => outputs[i] = JSON.stringify(err));
            promises.push(promise);
        }
        await Promise.all(promises);

        if (outputs.length === 1) return outputs[0];
        return outputs;
    }

    public getNodeName(): string {
        return 'GraphQL';
    }

    public buildDependencies(iterable, value, key) {
        switch (key) {
            case 'method':
                this.setIterables(iterable, value, key);
                this.dependencies.method = value;
                break;
            case 'url':
                this.setIterables(iterable, value, key);
                this.dependencies.url = value;
                break;
            case 'query':
                this.setIterables(iterable, value, key);
                this.dependencies.query = value;
                break
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.method !== null &&
            this.dependencies.url !== null &&
            this.dependencies.query !== null;
    }
}