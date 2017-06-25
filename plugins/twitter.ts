const Twitter = require("twitter");
// TODO
// import * as Twitter from "twitter";

export let name = "Tweeter";

export let inputs = {
    tweet: "text",
};

export let outputs = {};

export let requires = {
    consumer_key: "string",
    consumer_secret: "string",
    access_token_key: "string",
    access_token_secret: "string",
};

export let run = (requires: object, args: any): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        // do twitter stuff
        let client = new Twitter(requires);

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

