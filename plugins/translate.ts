const Translate = require('@google-cloud/translate');
const projectId = "testfirstapp1";
import * as fs from "fs";

const languages = JSON.parse(fs.readFileSync("./plugins/languages.json", "utf8"));

// TODO
// import * as Twitter from "twitter";

export let name = "Translater"

export let verbs = ["translate"];

export let inputs = {
    "text": "string",
    "language": "string"
}

export let outputs = {
    "translated": "string"
}

export let requires = {
    api_key: "string"
};

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        const translateClient = Translate({
            projectId: projectId,
            key: requires.api_key
        });
        translateClient.translate(input.text, input.language)
        .then((results: any) => {
            const translation = results[0];
            resolve({ "translated": translation });
        })
        .catch((err: any) => {
            console.error('ERROR:', err);
            reject(err);
        });
    });
};

export interface Inputs {
    text: string | null,
    language: string | null,
}

export function parse_language(verb: string, tokens: any[]): Inputs {
    // we know verb will only ever be to translate something

    let language: string | null = null;
    let text = [];

    for (let i = 0; i < tokens.length; i += 1) {
        if (languages[tokens[i].text.content]) {
            // we found the language
            language = languages[tokens[i].text.content];

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
