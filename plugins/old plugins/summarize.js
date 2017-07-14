"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unirest = require("unirest");
const striptags = require("striptags");
const request = require("request");
exports.name = "Summarizer";
exports.inputs = {
    "url": "string",
};
exports.outputs = {
    "summarized": "string"
};
exports.requires = {
    length: "string"
};
exports.run = (input, requires) => {
    return new Promise((resolve, reject) => {
        request("https://arstechnica.com/gaming/2017/06/roundup-the-best-escape-room-games-for-a-breakout-party/", function (error, response, body) {
            //console.log(body);
            let data = striptags(body);
            //console.log(data);
            unirest.post("https://textanalysis-text-summarization.p.mashape.com/text-summarizer-text")
                .header("X-Mashape-Key", "0ZMCFUgJcZmsheN5g0vybr743wQ3p16mXWzjsnkZtcNv6rfY3O")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/json")
                .send("sentnum=" + "5")
                .send("text=" + data)
                .end(function (result) {
                var summary = "";
                for (var i = 0; i < result.body.sentences.length; i++) {
                    summary += result.body.sentences[i];
                    summary += " ";
                }
                resolve({ "summarized": summary });
            }).catch((err) => {
                console.error("ERROR: ", err);
                reject(err);
            });
        });
    });
};
exports.verbs = ["summarize"];
function parse_language(verb, tokens) {
    if (tokens[0] === "it") {
        return { url: null };
    }
    else {
        return { url: tokens[0].text.content };
    }
}
exports.parse_language = parse_language;
//# sourceMappingURL=summarize.js.map