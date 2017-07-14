"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter = require("twitter");
// TODO
// import * as Twitter from "twitter";
exports.name = "Tweeter";
exports.verbs = ["tweet"];
exports.inputs = {
    tweet: "string",
};
exports.outputs = {
    tweet: "string",
};
exports.requires = {
    consumer_key: "string",
    consumer_secret: "string",
    access_token_key: "string",
    access_token_secret: "string",
};
exports.run = (requires, args) => {
    return new Promise((resolve, reject) => {
        // do twitter stuff
        let client = new Twitter({
            consumer_key: requires.consumer_key,
            consumer_secret: requires.consumer_secret,
            access_token_key: requires.access_token_key,
            access_token_secret: requires.access_token_secret
        });
        // post tweet
        client.post("statuses/update", {
            status: args.tweet,
        }, (error) => {
            if (error) {
                reject(error[0]);
            }
            else {
                resolve({
                    tweet: args.tweet,
                });
            }
        });
    });
};
function parse_language(verb, tokens) {
    // we know verb will only ever be to tweet something
    // we're just going to take all the words, except for 'it'
    let text = [];
    for (let token of tokens) {
        text.push(token.text.content);
    }
    // if it's "it" we have to get it from somewhere else
    if (text.length === 1 && text[0] === "it") {
        text = [];
    }
    return {
        tweet: text.length == 0 ? null : text.join(" "),
    };
}
exports.parse_language = parse_language;
//# sourceMappingURL=twitter.js.map