import * as fs from "fs";

export let name = "File Write";
export let verbs = ["write", "save"];
export let inputs = {
    "filePath": "string",
    "data": "string"
}
export let outputs = {};
export let requires = {};

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        fs.writeFile(requires.filePath, input.data, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function parse_language(verb: string, tokens: any[]) {
    let text: string[] = [];

    for (let token of tokens) {
        text.push(token.text.content);
    }

    return {
        filePath: text.length === 0 ? null : text[0]
    }
}
