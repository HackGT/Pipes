const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

import { OutputPlugin, Mapper } from './Node';

interface Input {
    to?: string|string[],
    text?: string|string[],
    from?: string,
    subject?: string,
    api_user?: string,
    api_key?: string,
    iterable?: boolean
}

export class Email extends OutputPlugin {
    private body: Input = {};
    private counter: number = 0;
    private iterable: {[K: string]: boolean} = {};

    public getContentMap() {
        return new Mapper({'data': 'text'});
    }

    public propagate(input: Input): void {
        for (const key of Object.keys(input)) {
            if (key === 'iterable') {
                for (const subKey of Object.keys(input)) {
                    if (subKey === 'iterable') {
                        continue;
                    }
                    this.iterable[subKey] = input[key]
                }
                continue;
            }
            this.body[key] = input[key];
            this.counter++;
        }
        if (this.counter >= 6) {
            const options = {
                auth: {
                    api_user: this.body.api_user,
                    api_key: this.body.api_key
                }
            };

            const client = nodemailer.createTransport(sgTransport(options));

            const length: number = this.getIterLength(this.body.to, this.iterable.to, this.body.text, this.iterable.text);
            for(let i=0; i < length; i++) {
                let email = {
                    from: this.body.from,
                    to: this.iterable.to ? this.body.to[i] : this.body.to,
                    subject: this.body.subject,
                    text: this.iterable.text ? this.body.text[i] : this.body.text
                }
                client.sendMail(email, function(err, info){
                    if (err ){
                      console.log(err);
                    }
                    else {
                      console.log('Message sent');
                    }
                });
            }
        }
    }

    private getIterLength(to: string|string[], toIter: boolean, text: string|string[], textIter: boolean): number {
        if (!toIter && !textIter) {
            return 1;
        } else if (toIter && !textIter) {
            return to.length;
        } else if (!toIter && textIter) {
            return text.length;
        } else {
            return text.length - to.length > 0 ? to.length : text.length;
        }
    }
}