import { OutputPlugin } from '../Output';
import * as request from 'request';


type pluginDependencies = {
    text: string | string[],
    url: string
}

export class SlackHook extends OutputPlugin {
    private dependencies: pluginDependencies = { text: null, url: null };

    public async propagate(): Promise<string | string[]> {

        const sendMessage = (text) => new Promise((resolve, reject) => {
                request.post({
                    url: this.dependencies.url,
                    body: JSON.stringify({ text: text }),
                    headers: { 'content-type': 'application/json' }
                }, function (err, response) {
                    if (err) { reject(err); }
                    else { resolve(response); }
                });
            }
        );

        let outputs: any = [];
        const promises = [];
        if (Array.isArray(this.dependencies.text)) {
            for (let i = 0; i < this.dependencies.text.length; i++) {
                promises.push(sendMessage(this.dependencies.text[i])
                    .then(out => outputs[i] = { ok: true, body: out })
                    .catch(err => outputs[i] = { ok: false, body: err }));
            }
        } else {
            promises.push(sendMessage(this.dependencies.text)
                .then(out => outputs = { ok: true, body: out })
                .catch(err => outputs = { ok: false, body: err }));
        }

        await Promise.all(promises);

        return outputs;
    }

    public getNodeName(): string {
        return 'SlackHook';
    }

    public buildDependencies(iterable, value, key) {
        if (key === 'text') {
            this.dependencies.text = value;
        } else if (key === 'url') {
            if (Array.isArray(value))
                throw new Error('SlackHook url must be a single string');
            this.dependencies.url = value;
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.text !== null && this.dependencies.url !== null;
    }

}