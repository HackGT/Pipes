const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

import { OutputPlugin, Mapper } from './Node';

interface Input {
    [K: string]: string;
}

export class Email extends OutputPlugin {
    private body: Input = {};
    private counter: number = 0;

    public getContentMap() {
        return new Mapper({'data': 'text'});
    }

    public propagate(input: Input): void {
        for (const key of Object.keys(input)) {
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
            const email = {
                from: this.body.from,
                to: this.body.to,
                subject: this.body.subject,
                text: this.body.text
            };
            const client = nodemailer.createTransport(sgTransport(options));
            client.sendMail(email, function(err, info){
                if (err ){
                  console.log(err);
                }
                else {
                  console.log('Message sent: ' + JSON.stringify(info));
                }
            });
        }
    }
}