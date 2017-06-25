import * as Slack from "slack-node";
export let name = "Slack Webhooks";

export let inputs = {
    "message": "string",
    "channel": "string"
};

export let outputs = {};

export let requires = {
    "webhook_url": "string",
    "username": "string",
};

export let run = (requires: any, args: any): Promise < void > => {
    return new Promise < void > ((resolve, reject) => {
        let slack = new Slack();
        slack.setWebhook(requires.webhook_url);
        slack.webhook({
            channel: args.channel,
            username: requires.username,
            text: requires.message
        }, function (err, response) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
