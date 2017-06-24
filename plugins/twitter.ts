const Twitter = require("twitter");
// TODO
// import * as Twitter from "twitter";

export let inputs = [
    "text",
];

export let outputs = [];

export let requires = {
    consumer_key: "text",
    consumer_secret: "text",
    access_token_key: "text",
    access_token_secret: "text",
};


export let run = (requires: object, text: string) => {
    return new Promise<void>((resolve, reject) => {
        // do twitter stuff
        let client = new Twitter(requires);

        // post tweet
        client.post("statuses/update", {
            status: text,
        }, (error: Error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

