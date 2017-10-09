var Twit = require('twit');

import { OutputPlugin } from '../Output';

type pluginDependencies = {
    consumerKey: string,
    consumerSecret: string,
    accessToken: string,
    accessTokenSecret: string,
    status: string | string[]
}

export class Twitter extends OutputPlugin {

    private dependencies: pluginDependencies = {
        consumerKey: null,
        consumerSecret: null,
        accessToken: null,
        accessTokenSecret: null,
        status: null
    };

    public async propagate(): Promise<string | string[]> {
        const { 
            consumerKey, 
            consumerSecret, 
            accessToken,
            accessTokenSecret,
            status
         } = this.dependencies;

        const promises = [];
        const outputs = [];

        const twitter = new Twit({
          consumer_key: consumerKey,
          consumer_secret: consumerSecret,
          access_token: accessToken,
          access_token_secret: accessTokenSecret,
        });
        const sendMessage = (status) => new Promise((resolve, reject) => {
            twitter.post('statuses/update', {'status': status}, (err, body) => {
                if (err) {
                    reject(err);
                } else if (body) {
                    resolve(body);
                }
            });
        });

        if(this.numIter === null) this.numIter = 1;
        for (let i = 0; i < this.numIter; i++) {
            const promise = sendMessage(
                Array.isArray(status) ? status[i] : status)
                .then(val => outputs[i] = JSON.stringify(val))
                .catch(err => outputs[i] = JSON.stringify(err));
            promises.push(promise);
        }

        await Promise.all(promises);

        if (outputs.length === 1) return outputs[0];
        return outputs;
    }

    public getNodeName(): string {
        return 'Twitter';
    }

    public buildDependencies(iterable, value, key) {
        switch (key) {
            case 'consumerKey':
                if (iterable || Array.isArray(value))
                    throw Error(`Twitter's property 'consumerKey' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.consumerKey = value;
                break;
            case 'consumerSecret':
                if (iterable || Array.isArray(value))
                    throw Error(`Twitter's property 'consumerSecret' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.consumerSecret = value;
                break;
            case 'accessToken':
                if (iterable || Array.isArray(value))
                    throw Error(`Twitter's property 'accessToken' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.accessToken = value;
                break;
            case 'accessTokenSecret':
                if (iterable || Array.isArray(value))
                    throw Error(`Twitter's property 'status' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.accessTokenSecret = value;
                break;
            case 'status':
                this.setIterables(iterable, value, key);
                this.dependencies.status = value;
        
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.consumerKey !== null &&
            this.dependencies.consumerSecret !== null &&
            this.dependencies.accessToken !== null &&
            this.dependencies.accessTokenSecret !== null &&
            this.dependencies.status !== null;    }
}