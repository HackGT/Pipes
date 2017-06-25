import * as Slack from "slack-node";
export let name = "Slack Webhooks";

export let inputs = {
    "message": "string",
    "channel": "string"
};

export let outputs = {
    "message": "string",
};

export let verbs = ["slack"];

export let requires = {
    "webhook_url": "string",
    "username": "string",
};

export let run = (requires: any, args: any): Promise<{message: string}> => {
    return new Promise<{message: string}>((resolve, reject) => {
        let slack = new Slack();
        slack.setWebhook(requires.webhook_url);
        slack.webhook({
            channel: args.channel,
            text: args.message,
            username: requires.username,
        }, function (err: Error, response: any) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    message: args.message,
                });
            }
        });
    });
};

export interface Inputs {
    message: string | null;
    channel: string;
}

export function parse_language(verb: string, tokens: any[], root: number): Inputs {
    let channel = null;
    let text = [];
    let start = 0;
    let end = tokens.length;

    if (tokens[tokens.length - 2].text.content === "to") {
        channel = tokens[tokens.length - 1].text.content;
        end = tokens.length - 2;
    } else if (
        tokens[tokens.length - 4].text.content === "to" &&
        tokens[tokens.length - 3].text.content === "the" &&
        tokens[tokens.length - 1].text.content === "channel"
    ) {
        channel = tokens[tokens.length - 2].text.content;
        end = tokens.length - 4;
    } else if (
        tokens[0].text.content === "to" &&
        tokens[1].text.content === "the" &&
        tokens[3].text.content === "channel"
    ) {
        channel = tokens[2].text.content;
        start = 4;
    } else if (
        tokens[0].text.content === "to"
    ) {
        channel = tokens[1].text.content;
        start = 2;
    } else {
        channel = tokens[0].text.content;
        start = 1;
    }

    for (let i = start; i < end; i += 1) {
        text.push(tokens[i].text.content);
    }

    if (text.length === 1 && text[0] === "it") {
        text.pop();
    }

    return {
        message: text.length === 0 ? null : text.join(" "),
        channel: channel,
    }
}
