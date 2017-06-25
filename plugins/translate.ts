const Translate = require('@google-cloud/translate');
const projectId = "testfirstapp1";

// TODO
// import * as Twitter from "twitter";

export let name = "Translater"
export let inputs = {
    "text": "text",
    "langauge": "text"
}

export let outputs = {
    "out": "text"
}

export let requires = {
    api_key: "text"
};

export let run = (requires: any, input: any) => {
    return new Promise<string>((resolve, reject) => {
        const translateClient = Translate({
            projectId: projectId,
            key: requires.api_key
        });
        translateClient.translate(input.text, input.language)
        .then((results: any) => {
            const translation = results[0];
            resolve(translation);
        })
        .catch((err: any) => {
            console.error('ERROR:', err);
            reject(err);
        });
    });        
};
