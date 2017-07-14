"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Translate = require('@google-cloud/translate');
const projectId = "testfirstapp1";
const fs = require("fs");
const languages = JSON.parse(fs.readFileSync("./plugins/languages.json", "utf8"));
// TODO
// import * as Twitter from "twitter";
exports.name = "Translater";
exports.verbs = ["translate"];
exports.inputs = {
    "text": "string",
    "language": "string"
};
exports.outputs = {
    "translated": "string"
};
exports.requires = {
    api_key: "string"
};
exports.run = (requires, input) => {
    return new Promise((resolve, reject) => {
        const translateClient = Translate({
            projectId: projectId,
            key: requires.api_key
        });
        let language = languages.long_to_short[input.language];
        translateClient.translate(input.text, language)
            .then((results) => {
            const translation = results[0];
            resolve({ "translated": translation });
        })
            .catch((err) => {
            console.error('ERROR:', err);
            reject(err);
        });
    });
};
function parse_language(verb, tokens) {
    // we know verb will only ever be to translate something
    let language = null;
    let text = [];
    for (let i = 0; i < tokens.length; i += 1) {
        if (languages.long_to_short[tokens[i].text.content]) {
            // we found the language
            language = tokens[i].text.content;
            // commonly the word before is a desc. prep.
            if (tokens[i - 1] && tokens[i - 1].partOfSpeech.tag === "ADP") {
                text.pop();
            }
        }
        else {
            text.push(tokens[i].text.content);
        }
    }
    // if it's "it" we have to get it from somewhere else
    if (text.length === 1 && text[0] === "it") {
        text = [];
    }
    return {
        text: text.length == 0 ? null : text.join(" "),
        language: language,
    };
}
exports.parse_language = parse_language;
//# sourceMappingURL=translate.js.map