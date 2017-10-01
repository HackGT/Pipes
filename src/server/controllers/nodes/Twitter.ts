const request = require('request');

import { OutputPlugin, Mapper } from './Node';

interface Input {
    [K: string]: string;
}

export class Twitter extends OutputPlugin {
    private url: string = "https://api.twitter.com/1.1/statuses/update.json";
    private body: Input = {};
    private counter: number = 0;

    public getContentMap() {
        return new Mapper({'data': 'status'});
    }

    public propagate(input: Input): void {
        for (const key of Object.keys(input)) {
            this.body[key] = input[key];
            this.counter++;
        }
        if (this.counter >= 3) {
            const auth = this.doAuth()   
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

    private doAuth(): string {

        return '';
    }
}