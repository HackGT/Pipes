const request = require('request');		

import { OutputPlugin } from '../Output';

type pluginDependencies = {
    apiKey: string,
    appId: string,
    content: string
}

export class Push extends OutputPlugin {

    private dependencies: pluginDependencies = {
        apiKey: null,
        appId: null,
        content: null
    };

    public async propagate(): Promise<string | string[]> {
        const url = 'https://onesignal.com/api/v1/notifications';
        const { apiKey, appId, content } = this.dependencies;

        const promises = [];
        const outputs = [];
        const sendMessage = (appId, content, apiKey) => new Promise((resolve, reject) => {
                request.post({
                	url: url,
                	body: JSON.stringify({
	        			app_id: appId,
	        			contents: {
	        				en: content
	        			},
	        			included_segments: ["All"]
                	}),
                	headers: {
                		'content-type': 'application/json',
                		'Authorization': "Basic " + apiKey
                	}
                }, function (err, response) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response);
                    }
                });
            }
        );
	// all dependencies can only be single values rn, but keeping this here in case we change that.
        if(this.numIter === null) this.numIter = 1;
        for (let i = 0; i < this.numIter; i++) {
            const promise = sendMessage(
            	appId,
            	Array.isArray(content) ? content[i] : content,
            	apiKey)
                .then(val => outputs[i] = JSON.stringify(val))
                .catch(err => outputs[i] = JSON.stringify(err));
            promises.push(promise);
        }
        await Promise.all(promises);

        if (outputs.length === 1) return outputs[0];
        return outputs;
    }

    public getNodeName(): string {
        return 'Push';
    }

    public buildDependencies(iterable, value, key) {
        switch (key) {
            case 'apiKey':
                if (iterable || Array.isArray(value))
                    throw Error(`Push's property 'apiKey' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.apiKey = value;
                break;
            case 'appId':
                if (iterable || Array.isArray(value))
                    throw Error(`Push's property 'appId' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.appId = value;
                break;
            case 'content':
                if (iterable || Array.isArray(value))
                    throw Error(`Push's property 'content' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.content = value;
                break;
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.apiKey !== null &&
            this.dependencies.appId !== null &&
            this.dependencies.content !== null;
    }
}
