const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

import { OutputPlugin } from '../Output';

type pluginDependencies = {
    api_user: string,
    api_key: string,
    from: string | string[],
    to: string | string[],
    subject: string | string[],
    text: string | string[]
}

export class Email extends OutputPlugin {
    private dependencies: pluginDependencies = {
        api_user: null,
        api_key: null,
        from: null,
        to: null,
        subject: null,
        text: null
    };

    public async propagate(): Promise<string[]> {

        const options = {
            auth: {
                api_user: this.dependencies.api_user,
                api_key: this.dependencies.api_key
            }
        };

        const { from, to, subject, text } = this.dependencies;

        // We can set numIter to 1 because the node would function normally
        if(this.numIter === null) this.numIter = 1;

        const promises = [];
        const outputs = [];

        for (let i = 0; i < this.numIter; i++) {
            const email = {
                from: Array.isArray(from) ? from[i] : from,
                to: Array.isArray(to) ? to[i] : to,
                subject: Array.isArray(subject) ? subject[i] : subject,
                text: Array.isArray(text) ? text[i] : text
            };

            const client = nodemailer.createTransport(sgTransport(options));
            const promise = client.sendMail(email)
                .then((val)=>{
                    outputs[i] = JSON.stringify(val);
                }).catch((err) => {
                    outputs[i] = JSON.stringify(err);
                });
            promises.push(promise);
        }

        await Promise.all(promises);

        if(outputs.length === 1) return outputs[0];
        return outputs;

    }

    public getNodeName(): string {
        return 'Email';
    }

    public buildDependencies(iterable: boolean, value: string | string[], key: string) {
        switch (key) {
            case 'api_user':
                if (iterable || Array.isArray(value))
                    throw Error(`Concat's property 'api_user' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.api_user = value;
                break;
            case 'api_key':
                if (iterable || Array.isArray(value))
                    throw Error(`Concat's property 'api_key' must be a single string. 
                    Unexpected value ${value}`);
                this.dependencies.api_key = value;
                break;
            case 'from':
                this.setIterables(iterable, value, key);
                this.dependencies.from = value;
                break;
            case 'to':
                this.setIterables(iterable, value, key);
                this.dependencies.to = value;
                break;
            case 'subject':
                this.setIterables(iterable, value, key);
                this.dependencies.subject = value;
                break;
            case 'text':
                this.setIterables(iterable, value, key);
                this.dependencies.text = value;
                break;
        }
    }

    public isSatisfied(): boolean {
        return this.dependencies.api_key !== null &&
            this.dependencies.api_key !== null &&
            this.dependencies.from !== null &&
            this.dependencies.to !== null &&
            this.dependencies.subject !== null &&
            this.dependencies.text !== null;
    }

}