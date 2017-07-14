const request = require('request');
const crypto = require('crypto');

const POLL_INTERVAL = 60000;

export let name = "Url Watcher"

export let verbs = ["watch"];

export let inputs = {
    "url": "string",
}

export let outputs = {
    "url": "string"
}

export let requires = {
};

export let run = (requires: any, input: any) => {
    console.log("running");
    if (!input.url.match(/^http[s]{0,1}:\/\//)) {
        input.url = "http://" + input.url;
    }
    let last_hash: string | null = null;

    return new Promise<{url: string}>((resolve, reject) => {
        let attempt = () => {
            request(input.url, function(error: Error, response: any, body: any) {
                if (error) {
                    reject(error);
                    return;
                }
                let hash = crypto.createHash("sha256").update(body).digest("hex");
                if (last_hash != null && last_hash != hash) {
                    resolve({
                        url: input.url,
                    });
                }
                console.log("Logged web hash", hash);
                last_hash = hash;
                setTimeout(attempt, POLL_INTERVAL);
            });
        };
        attempt();
    })
};

export function parse_language(verb: string, tokens: any[]) {
    let url = [];

    for (let token of tokens) {
        url.push(token.text.content);
    }

    return {
        url: url.join(""),
    };
}
