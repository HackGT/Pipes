import * as fs from "fs";

export let name = "File Read";
export let verbs = ["read", "open"];
export let inputs = {
    "filePath": "string"
}
export let outputs = {
    "data": "string"
}
export let requires = {}

export let run = (requires: any, input: any) => {
    return new Promise<any>((resolve, reject) => {
        fs.readFile(input.filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                data
            });
        });
    });
}

interface Inputs {
    filePath: string | null;
}
export function parse_language(verb: string, tokens: any[]): Inputs {
    let text: string[] = [];

    for (let token of tokens) {
        text.push(token.text.content);
    }

    return {
        filePath: text.length === 0 ? null : text.join("")
    }
}
