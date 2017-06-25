const Twitter = require("twitter");
// TODO
// import * as Twitter from "twitter";

export let name = "Tweeter";

export let verbs = ["tweet"];

export let inputs = {
    tweet: "string",
};

export let outputs = {};

export let requires = {
    consumer_key: "string",
    consumer_secret: "string",
    access_token_key: "string",
    access_token_secret: "string",
};

export let run = (requires: any, args: any): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
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
        }, (error: Error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

export interface Inputs {
    tweet: string | null,
}

export function parse_language(verb: string, tokens: any[]): Inputs {
    // we know verb will only ever be to tweet something
    // we're just going to take all the words, except for 'it'
    let text: string[] = [];

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

