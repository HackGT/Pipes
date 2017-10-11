import { OutputPlugin } from '../Output';
import * as SlackAPI from "slack-node";


type pluginDependencies = {
    channel: string | string[],
    text: string | string[],
    token: string
}

export class Slack extends OutputPlugin {

    private dependencies: pluginDependencies = {
        token: null,
        text: null,
        channel: null
    };

    public async propagate(): Promise<string | string[]> {
        const url = 'https://slack.com/api/chat.postMessage';
        const { channel, token, text } = this.dependencies;

        const promises = [];
        const outputs = [];

        const slack = new SlackAPI(token);
        const sendMessage = (channel, text) => new Promise((resolve, reject) => {
                slack.api('chat.postMessage', {
                    channel,
                    text,
                    parse: 'full',
                    as_user: true
                }, function (err, response) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response);
                    }
                })
            }
        );

        if(this.numIter === null) this.numIter = 1;
        for (let i = 0; i < this.numIter; i++) {
            const promise = sendMessage(
                Array.isArray(channel) ? channel[i] : channel,
                Array.isArray(text) ? text[i] : text)
                .then(val => outputs[i] = JSON.stringify({ok: true, body: val}))
                .catch(err => outputs[i] = JSON.stringify({ok: false, body: err}));
            promises.push(promise);
        }
        await Promise.all(promises);

        if (outputs.length === 1) return outputs[0];
        return outputs;
    }

    public getNodeName(): string {
        return 'Slack';
    }

    public buildDependencies(iterable, value, key) {
        switch (key) {
            case 'token':
                if (iterable || Array.isArray(value))
                    throw Error(`Slack's property 'token' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.token = value;
                break;
            case 'text':
                this.setIterables(iterable, value, key);
                this.dependencies.text = value;
                break;
            case 'channel':
                this.setIterables(iterable, value, key);
                this.dependencies.channel = value;
                break
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.token !== null &&
            this.dependencies.text !== null &&
            this.dependencies.channel !== null;
    }
}