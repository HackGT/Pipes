"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Slack = require("slack-node");
exports.name = "Slack Webhooks";
exports.inputs = {
    "message": "string",
    "channel": "string"
};
exports.outputs = {
    "message": "string",
};
exports.verbs = ["slack"];
exports.requires = {
    "webhook_url": "string",
    "username": "string",
};
exports.run = (requires, args) => {
    return new Promise((resolve, reject) => {
        let slack = new Slack();
        slack.setWebhook(requires.webhook_url);
        slack.webhook({
            channel: args.channel,
            text: args.message,
            username: requires.username,
        }, function (err, response) {
            if (err) {
                reject(err);
            }
            else {
                resolve({
                    message: args.message,
                });
            }
        });
    });
};
function parse_language(verb, tokens, root) {
    let channel = null;
    let text = [];
    let start = 0;
    let end = tokens.length;
    if (tokens[tokens.length - 2].text.content === "to") {
        channel = tokens[tokens.length - 1].text.content;
        end = tokens.length - 2;
    }
    else if (tokens[tokens.length - 4].text.content === "to" &&
        tokens[tokens.length - 3].text.content === "the" &&
        tokens[tokens.length - 1].text.content === "channel") {
        channel = tokens[tokens.length - 2].text.content;
        end = tokens.length - 4;
    }
    else if (tokens[0].text.content === "to" &&
        tokens[1].text.content === "the" &&
        tokens[3].text.content === "channel") {
        channel = tokens[2].text.content;
        start = 4;
    }
    else if (tokens[0].text.content === "to") {
        channel = tokens[1].text.content;
        start = 2;
    }
    else {
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
    };
}
exports.parse_language = parse_language;
//# sourceMappingURL=slack.js.map