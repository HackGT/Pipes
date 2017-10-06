const request = require('request');

import { OutputPlugin, Mapper } from './Node';

interface Input {
}

export class Slack extends OutputPlugin {
    private url: string = "https://slack.com/api/chat.postMessage";
    private body: string;
    private counter: number = 0;

    public getContentMap() {
        return new Mapper({'data': 'text'});
    }

    public propagate(input: Input): void {
        for (const key of Object.keys(input)) {
            if (key === 'iterable') {
                continue;
            }
            this.body += `&${key}=${input[key]}`;
            this.counter++;
        }
        if (this.counter >= 3) {
            request.post({
                url: this.url,
                body: this.body,
                headers: {'content-type' : 'application/x-www-form-urlencoded'},
            }, (err, res, body) => {
                if (err) { return console.log(err); }
                console.log(body);
            });
        }
    }
}