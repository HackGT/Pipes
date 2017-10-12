var graph = require('fbgraph');

import { OutputPlugin } from '../Output';

type pluginDependencies = {
    message: string | string[],
    accessToken: string,
    id: string | string[]
}

export class Facebook extends OutputPlugin {
    private dependencies: pluginDependencies = {
        message: null,
        accessToken: null,
        id: null
    };

    public async propagate(): Promise<string | string[]> {
        const { message, accessToken, id } = this.dependencies;

        const promises = [];
        const outputs = [];
        const sendMessage = (message, id) => new Promise((resolve, reject) => {
                graph.setAccessToken(accessToken);
                graph.post(`${id}/feed`, {message: message}, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            }
        );

        if(this.numIter === null) this.numIter = 1;
        for (let i = 0; i < this.numIter; i++) {
            const promise = sendMessage(
                Array.isArray(message) ? message[i] : message,
                Array.isArray(id) ? id[i] : id)
                .then(val => outputs[i] = JSON.stringify({ok: true, body: val}))
                .catch(err => outputs[i] = JSON.stringify({ok: false, body: err}));
            promises.push(promise);
        }
        await Promise.all(promises);

        if (outputs.length === 1) return outputs[0];
        return outputs;
    }

    public getNodeName(): string {
        return 'Facebook';
    }

    public buildDependencies(iterable, value, key) {
        switch (key) {
            case 'accessToken':
                if (iterable || Array.isArray(value))
                    throw Error(`Facebook's property 'accessToken' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.accessToken = value;
                break;
            case 'message':
                this.setIterables(iterable, value, key);
                this.dependencies.message = value;
                break;
            case 'id':
                this.setIterables(iterable, value, key);
                this.dependencies.id = value;
                break
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.accessToken !== null &&
            this.dependencies.message !== null &&
            this.dependencies.id !== null;
    }
}