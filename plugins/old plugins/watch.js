"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request');
const crypto = require('crypto');
const POLL_INTERVAL = 60000;
exports.name = "Url Watcher";
exports.verbs = ["watch"];
exports.inputs = {
    "url": "string",
};
exports.outputs = {
    "url": "string"
};
exports.requires = {};
exports.run = (requires, input) => {
    console.log("running");
    if (!input.url.match(/^http[s]{0,1}:\/\//)) {
        input.url = "http://" + input.url;
    }
    let last_hash = null;
    return new Promise((resolve, reject) => {
        let attempt = () => {
            request(input.url, function (error, response, body) {
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
    });
};
function parse_language(verb, tokens) {
    let url = [];
    for (let token of tokens) {
        url.push(token.text.content);
    }
    return {
        url: url.join(""),
    };
}
exports.parse_language = parse_language;
//# sourceMappingURL=watch.js.map